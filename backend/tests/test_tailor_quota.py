from datetime import date, timedelta

from app.crud.user import DAILY_TAILOR_LIMIT, consume_tailor_quota

# Unit tests for the quota-counting logic itself, using a bare stand-in for User/AsyncSession
# rather than a real database — consume_tailor_quota only reads/writes plain attributes and
# calls db.commit(), so a real DB round-trip would test nothing extra here. Rate-limiting
# behavior as exposed through the actual API is covered separately in test_resumes.py.


class _FakeUser:
    def __init__(self, unlimited_tailoring=False, tailor_count=0, tailor_count_date=None):
        self.unlimited_tailoring = unlimited_tailoring
        self.tailor_count = tailor_count
        self.tailor_count_date = tailor_count_date


class _FakeDb:
    async def commit(self):
        pass


async def test_consume_tailor_quota_allows_up_to_the_daily_limit():
    user = _FakeUser(tailor_count_date=date.today())
    db = _FakeDb()

    for _ in range(DAILY_TAILOR_LIMIT):
        assert await consume_tailor_quota(db, user) is True

    assert await consume_tailor_quota(db, user) is False
    assert user.tailor_count == DAILY_TAILOR_LIMIT


async def test_consume_tailor_quota_resets_on_a_new_day():
    user = _FakeUser(tailor_count=DAILY_TAILOR_LIMIT, tailor_count_date=date.today() - timedelta(days=1))
    db = _FakeDb()

    assert await consume_tailor_quota(db, user) is True
    assert user.tailor_count == 1
    assert user.tailor_count_date == date.today()


async def test_consume_tailor_quota_unlimited_account_always_allowed():
    user = _FakeUser(unlimited_tailoring=True, tailor_count=DAILY_TAILOR_LIMIT, tailor_count_date=date.today())
    db = _FakeDb()

    assert await consume_tailor_quota(db, user) is True
    assert user.tailor_count == DAILY_TAILOR_LIMIT
