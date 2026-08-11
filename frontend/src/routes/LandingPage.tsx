import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import {
  BoardPreview,
  ResumesPreview,
  SearchPreview,
  TablePreview,
} from '../components/landing/ProductPreview'

const steps = [
  {
    number: '01',
    title: 'Save',
    description:
      'Drop in a company, role, and job link the moment you find something worth applying to.',
  },
  {
    number: '02',
    title: 'Track',
    description:
      'Move it through saved, applied, screening, interview, offer, or rejected as things happen.',
  },
  {
    number: '03',
    title: 'Land',
    description:
      'See your whole search at a glance instead of hunting through a dozen spreadsheet tabs.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="font-display text-lg">
            Pipeline<span className="text-accent">.</span>
          </span>
          <nav className="flex items-center gap-2">
            <Link to="/login" className="px-3 py-1.5 text-sm text-ink/60 hover:text-ink">
              Sign in
            </Link>
            <Link to="/register">
              <Button>Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_480px]">
          <div>
            <h1 className="font-display text-5xl leading-[1.1] md:text-6xl">
              Your job search, <br />
              in one place<span className="text-accent">.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-ink/60">
              Stop spinning up a new spreadsheet for every application season. Pipeline tracks
              every company, role, and status in a single board built for the search — not a
              browser extension, not a spreadsheet.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link to="/register">
                <Button className="px-6 py-3 text-base">Start tracking, free</Button>
              </Link>
              <Link to="/login" className="text-sm font-medium text-ink/60 hover:text-ink">
                I already have an account →
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <BoardPreview />
          </div>
        </div>
      </section>

      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-2xl">How it works</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-6">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm text-ink/30">{step.number}</span>
                  <span
                    className={
                      'h-1.5 w-1.5 rounded-full ' +
                      (i === 0 ? 'bg-sage' : i === 1 ? 'bg-accent' : 'bg-coral')
                    }
                  />
                </div>
                <h3 className="mt-3 font-display text-xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-center gap-16 lg:grid-cols-[420px_minmax(0,1fr)]">
            <div className="order-2 lg:order-1">
              <TablePreview />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-display text-2xl">Table or board — whichever fits how you think.</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/60">
                Scan everything at once in a dense table, or drag cards across a board when you
                just want to know what needs attention today. Same data, same search, switch
                anytime — nothing gets lost moving between them.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div>
              <h2 className="font-display text-2xl">Search across every season.</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/60">
                Applied to the same company two years running? Type a company or role and find it
                instantly instead of digging through old sheets — it filters as you type, right
                there in the table or board.
              </p>
            </div>
            <SearchPreview />
          </div>
        </div>
      </section>

      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-center gap-16 lg:grid-cols-[420px_minmax(0,1fr)]">
            <div className="order-2 lg:order-1">
              <ResumesPreview />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-display text-2xl">Resumes stay attached to the ones you sent.</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/60">
                Upload the version you actually sent for each application, so you know what they
                saw. Mark one as your default and set the rest aside for roles that need something
                tailored.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl">Ready to bring order to the chaos?</h2>
          <p className="mt-3 text-sm text-ink/50">
            Sign in with email, Google, or GitHub — whatever you already use.
          </p>
          <div className="mt-6">
            <Link to="/register">
              <Button className="px-6 py-3 text-base">Create your free account</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
