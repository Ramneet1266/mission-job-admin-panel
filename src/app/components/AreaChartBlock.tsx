"use client"

import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts"

const data = [
	{ name: "Jan 2", value: 3300 },
	{ name: "Jan 7", value: 8600 },
	{ name: "Jan 12", value: 7100 },
	{ name: "Jan 17", value: 10400 },
	{ name: "Jan 22", value: 6700 },
	{ name: "Jan 27", value: 6700 },
]

export default function AreaChartBlock() {
	return (
		<div style={{ width: "100%", height: 300 }}>
			<ResponsiveContainer>
				<AreaChart data={data}>
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip />
					<Area
						type="monotone"
						dataKey="value"
						stroke="#3b82f6"
						fill="#bfdbfe"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	)
}
