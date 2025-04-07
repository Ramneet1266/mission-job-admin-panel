interface StatCardProps {
	title: string
	value: string
	change: string
}

export default function StatCard({
	title,
	value,
	change,
}: StatCardProps) {
	return (
		<div className="bg-white rounded-2xl shadow p-4">
			<div className="text-sm text-gray-500">{title}</div>
			<div className="text-2xl font-bold">{value}</div>
			<div className="text-green-600 text-sm mt-1">{change}</div>
		</div>
	)
}
