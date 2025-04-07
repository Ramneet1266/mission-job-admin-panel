const topVideos = [
	{ title: "Build an Evergreen Traffic Machine...", time: "34.4K" },
	{
		title: "Start and grow your agency the right way",
		time: "17.1K",
	},
	{ title: "Get More Clients For Your Agency Today", time: "13.6K" },
	{
		title: "How to Write Cold Emails That Always Get Read",
		time: "9.3K",
	},
	{ title: "Kong Pham Shares His Secrets...", time: "6.7K" },
]

export default function TopVideos() {
	return (
		<div className="bg-white rounded-2xl shadow p-4">
			<h3 className="font-semibold text-lg mb-2">Top videos</h3>
			<p className="text-xs text-gray-500 mb-4">
				Watch time (minutes) · Last 28 days
			</p>
			<div className="space-y-2">
				{topVideos.map((video, i) => (
					<div key={i} className="flex justify-between">
						<span className="text-sm text-gray-700 truncate w-2/3">
							{video.title}
						</span>
						<span className="text-sm font-medium">{video.time}</span>
					</div>
				))}
			</div>
		</div>
	)
}
