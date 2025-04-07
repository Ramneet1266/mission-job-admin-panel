"use client"

import {
	BarChart,
	Bar,
	XAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts"

const data = new Array(48).fill(0).map((_, i) => ({
	name: `${-48 + i}h`,
	views: Math.floor(Math.random() * 180),
}))

export default function ActivityChart() {
	return (
		<div className="bg-white rounded-2xl shadow p-4">
			<div className="flex justify-between items-center mb-2">
				<div>
					<h3 className="font-semibold text-lg">Latest activity</h3>
					<p className="text-xs text-gray-500">
						Views · Last 48 hours
					</p>
				</div>
				<div className="text-right">
					<div className="text-lg font-bold">4,837</div>
					<div className="text-blue-500 text-xs">Updating live</div>
				</div>
			</div>
			<ResponsiveContainer width="100%" height={200}>
				<BarChart data={data}>
					<XAxis dataKey="name" hide />
					<Tooltip />
					<Bar dataKey="views" fill="#3b82f6" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}
