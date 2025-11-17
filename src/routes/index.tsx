import { createFileRoute } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'

export const Route = createFileRoute('/')({ component: LandingPage })

const ADVENTURE_OPTIONS = [
	{
		id: 'tour',
		title: 'Skyline Tour',
		accent: 'from-amber-600/40 to-stone-600/20 text-amber-950',
		emoji: '🧭',
		description: 'Explore iconic landmarks and hidden gems across the city',
	},
	{
		id: 'foodie',
		title: 'Mythic Foodie',
		accent: 'from-amber-500/50 to-yellow-600/30 text-amber-950',
		emoji: '🍝',
		description: 'Discover the best food and drink spots in your city',
	},
	{
		id: 'race',
		title: 'Skyway Race',
		accent: 'from-stone-600/40 to-amber-700/30 text-stone-950',
		emoji: '🏁',
		description: 'Race through the city visiting iconic locations',
	},
]

function LandingPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-black via-stone-950 to-amber-400 text-white">
			{/* Hero Section */}
			<section className="relative py-20 px-6 text-center overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10"></div>
				<div className="relative max-w-5xl mx-auto">
					<div className="relative overflow-hidden rounded-3xl border border-amber-700/30 bg-gradient-to-br from-amber-600/30 via-yellow-700/20 to-stone-800/90 p-8 sm:p-12 md:p-16 shadow-2xl mb-8">
						<div className="pointer-events-none absolute inset-0 opacity-60">
							<div className="absolute -top-10 -right-6 h-40 w-40 rounded-full bg-amber-400/40 blur-3xl" />
							<div className="absolute top-12 -left-10 h-32 w-32 rounded-full bg-yellow-500/30 blur-2xl animate-pulse" />
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,215,0,0.2),_transparent_55%)]" />
						</div>
						<div className="relative z-10 space-y-6">
							<h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.25em] text-white drop-shadow-[0_8px_30px_rgba(217,119,6,0.55)]">
								CityQuest
							</h1>
							<p className="text-xl sm:text-2xl md:text-3xl text-amber-100 font-light max-w-3xl mx-auto">
								A ChatGPT-powered adventure game
							</p>
						</div>
					</div>

					{/* Game Description */}
					<div className="max-w-3xl mx-auto">
						<p className="text-lg sm:text-xl text-amber-100/90 leading-relaxed">
							CityQuest is a ChatGPT-powered adventure game where ChatGPT acts as your
							game master, taking you through your city on an exciting journey. Explore
							real locations, complete challenges, take pictures, and earn scores as
							ChatGPT guides you through your chosen adventure.
						</p>
					</div>
				</div>
			</section>

			{/* Demo Section */}
			<section className="py-16 px-6 max-w-4xl mx-auto">
				<div className="rounded-3xl border border-amber-700/30 bg-amber-950/20 p-8 sm:p-10 shadow-2xl backdrop-blur">
					<h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-white">
						Demo
					</h2>
					<div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
						<iframe
							className="absolute top-0 left-0 w-full h-full rounded-lg"
							src="https://www.youtube.com/embed/MJ5RtWxOiZc"
							title="CityQuest Video"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
						/>
					</div>
				</div>
			</section>

			{/* ChatGPT Connection Guide */}
			<section className="py-16 px-6 max-w-4xl mx-auto">
				<div className="rounded-3xl border border-amber-700/30 bg-amber-950/20 p-8 sm:p-10 shadow-2xl backdrop-blur">
					<h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-white">
						Connect to ChatGPT
					</h2>
					<p className="text-center text-amber-100/90 mb-8 text-lg">
						CityQuest is a ChatGPT game. Connect the app as a connector to play directly
						in ChatGPT, where ChatGPT will be your game master.
					</p>

					<div className="space-y-6">
						<div className="flex gap-4 items-start">
							<div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-amber-950 font-bold">
								1
							</div>
							<div className="flex-1">
								<p className="text-white font-semibold mb-1">
									Enable Developer Mode
								</p>
								<p className="text-amber-100/80">
									Enable developer mode under{' '}
									<code className="px-2 py-1 bg-amber-900/50 rounded text-amber-200">
										Settings → Apps & Connectors → Advanced settings
									</code>{' '}
									in ChatGPT.
								</p>
							</div>
						</div>

						<div className="flex gap-4 items-start">
							<div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-amber-950 font-bold">
								2
							</div>
							<div className="flex-1">
								<p className="text-white font-semibold mb-1">Create Connector</p>
								<p className="text-amber-100/80">
									Click the <strong>Create</strong> button under{' '}
									<code className="px-2 py-1 bg-amber-900/50 rounded text-amber-200">
										Settings → Connectors
									</code>
									.
								</p>
							</div>
						</div>

						<div className="flex gap-4 items-start">
							<div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-amber-950 font-bold">
								3
							</div>
							<div className="flex-1">
								<p className="text-white font-semibold mb-1">Add Connector URL</p>
								<p className="text-amber-100/80 mb-2">
									Paste the connector URL:
								</p>
								<div className="bg-amber-900/50 rounded-lg p-3 border border-amber-700/30">
									<code className="text-amber-200 break-all">
										https://city-quest.netlify.app/mcp
									</code>
								</div>
							</div>
						</div>

						<div className="flex gap-4 items-start">
							<div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-amber-950 font-bold">
								4
							</div>
							<div className="flex-1">
								<p className="text-white font-semibold mb-1">
									Complete Setup
								</p>
								<p className="text-amber-100/80">
									Name the connector, add a description, and click{' '}
									<strong>Create</strong>.
								</p>
							</div>
						</div>

						<div className="flex gap-4 items-start">
							<div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-amber-950 font-bold">
								5
							</div>
							<div className="flex-1">
								<p className="text-white font-semibold mb-1">Start Playing</p>
								<p className="text-amber-100/80">
									In a new chat, click the <strong>+</strong> button, then select{' '}
									<strong>More</strong> to add your connector. ChatGPT will become
									your game master and guide you through your adventure!
								</p>
							</div>
						</div>
					</div>

					<div className="mt-8 pt-8 border-t border-amber-700/30">
						<a
							href="https://developers.openai.com/apps-sdk/quickstart"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors"
						>
							Learn more about connecting apps to ChatGPT
							<ExternalLink className="h-4 w-4" />
						</a>
					</div>
				</div>
			</section>

			{/* Adventure Types */}
			<section className="py-16 px-6 max-w-7xl mx-auto">
				<h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-white">
					Choose Your Adventure
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{ADVENTURE_OPTIONS.map((adventure) => (
						<div
							key={adventure.id}
							className="group relative overflow-hidden rounded-3xl border-2 border-amber-800/20 bg-amber-950/20 p-6 md:p-8 hover:border-amber-400 transition-all duration-300 hover:shadow-xl hover:shadow-amber-600/20"
						>
							<div
								className={`absolute inset-0 opacity-70 blur-xl transition group-hover:opacity-90 ${adventure.accent}`}
							>
								&nbsp;
							</div>
							<div className="relative z-10 flex flex-col items-center text-center gap-4">
								<span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-800/40 text-4xl">
									{adventure.emoji}
								</span>
								<div>
									<h3 className="text-2xl font-semibold text-white mb-2">
										{adventure.title}
									</h3>
									<p className="text-sm text-amber-100/80">
										{adventure.description}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	)
}
