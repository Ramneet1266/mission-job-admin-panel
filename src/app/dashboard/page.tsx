import ActivityChart from "../components/ActivityChart"
import AreaChartBlock from "../components/AreaChartBlock"
import StatCard from "../components/StatCard"
import TopVideos from "../components/TopVideos"

export default function DashboardPage() {
	return (
		<div className="p-4 space-y-6">
			{/* Stats Section */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<StatCard
					title="Watch time (minutes)"
					value="207.3K"
					change="+27%"
				/>
				<StatCard title="Views" value="86.9K" change="+22%" />
				<StatCard title="Subscribers" value="+976" change="+41%" />
			</div>

			{/* Area Chart */}
			<div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
				<AreaChartBlock />
			</div>

			{/* Bottom Section */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<TopVideos />
				<ActivityChart />
			</div>
		</div>
	)
}
