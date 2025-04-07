"use client"

import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts"

const data = [
	{ name: "Mon", value: 40 },
	{ name: "Tue", value: 30 },
	{ name: "Wed", value: 50 },
	{ name: "Thu", value: 70 },
	{ name: "Fri", value: 20 },
	{ name: "Sat", value: 90 },
	{ name: "Sun", value: 50 },
]

export default function Chart() {
	return (
		<div className="bg-white p-4 rounded-2xl shadow">
			<h2 className="text-lg font-semibold mb-2">Weekly Activity</h2>
			<ResponsiveContainer width="100%" height={250}>
				<LineChart data={data}>
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip />
					<Line
						type="monotone"
						dataKey="value"
						stroke="#3b82f6"
						strokeWidth={2}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}
