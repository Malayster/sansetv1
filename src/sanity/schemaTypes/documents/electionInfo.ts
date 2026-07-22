import { defineType, defineField } from 'sanity'

export default defineType({
	name: 'electionInfo',
	title: 'Maklumat Pilihan Raya',
	type: 'document',
	fields: [
		defineField({ name: 'electionName', title: 'Nama Pilihan Raya', type: 'string' }),
		defineField({ name: 'electionDate', title: 'Tarikh Pilihan Raya', type: 'date' }),
		defineField({
			name: 'electionType',
			title: 'Jenis Pilihan Raya',
			type: 'string',
			options: {
				list: [
					{ title: 'PRU', value: 'pru' },
					{ title: 'PRN', value: 'prn' },
				],
			},
		}),
		defineField({
			name: 'regionType',
			title: 'Jenis Kawasan',
			type: 'string',
			options: {
				list: [
					{ title: 'Parlimen', value: 'parlimen' },
					{ title: 'DUN', value: 'dun' },
				],
			},
		}),
		defineField({
			name: 'geoJsonFile',
			title: 'Nama Fail GeoJSON',
			description: 'Fail dalam /public/geojson/, contoh: pru16_parlimen.json',
			type: 'string',
		}),
		defineField({
			name: 'apiEndpoint',
			title: 'API Calon (URL)',
			description: 'Endpoint luaran untuk senarai calon',
			type: 'url',
		}),
		defineField({
			name: 'isActive',
			title: 'Aktif?',
			type: 'boolean',
			initialValue: false,
			description: 'Hanya satu pilihan raya aktif pada satu masa',
		}),
		defineField({
			name: 'states',
			title: 'Keputusan Mengikut Negeri',
			type: 'array',
			of: [
				{
					type: 'object',
					name: 'stateResult',
					fields: [
						defineField({ name: 'name', title: 'Nama Negeri', type: 'string' }),
						defineField({ name: 'party', title: 'Parti', type: 'string' }),
						defineField({ name: 'seats', title: 'Kerusi', type: 'number' }),
						defineField({ name: 'result', title: 'Keputusan', type: 'string' }),
					],
				},
			],
		}),
		defineField({ name: 'summary', title: 'Ringkasan', type: 'text' }),
	],
	preview: {
		select: { title: 'electionName', subtitle: 'electionDate' },
	},
})
