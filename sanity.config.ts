'use client'

/**
 * This configuration is used for the Sanity Studio mounted under `src/app/(studio)/<segment>/[[...tool]]/page.tsx`.
 * Keep `basePath` in sync with `ROUTES.studio` in `src/lib/env.ts` and the App Router folder name.
 */
// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { defineConfig, type DocumentActionComponent } from 'sanity'
import { assist } from '@sanity/assist'
import { codeInput } from '@sanity/code-input'
import {
	dashboardTool,
	projectInfoWidget,
	projectUsersWidget,
} from '@sanity/dashboard'
import { visionTool } from '@sanity/vision'
import { vercelWidget } from 'sanity-plugin-dashboard-widget-vercel'
import { media } from 'sanity-plugin-media'
import { ROUTES } from './src/lib/env'
import { apiVersion, dataset, projectId } from './src/sanity/env'
import icon from './src/sanity/icon'
import presentation from './src/sanity/presentation'
import { schema } from './src/sanity/schemaTypes'
import structure from './src/sanity/structure'
import JanaBeritaTool from './src/sanity/tools/jana-berita'
import ApproveAction from './src/sanity/actions/approve'

/** Tulis Semula AI — hantar artikel ke DeepSeek untuk rewrite penuh. */
const TulisSemulaAction: DocumentActionComponent = (props) => {
	const doc = props.draft || props.published
	if (props.type !== 'blog.post') return null
	if (!doc) return null

	return {
		label: '✍️ Tulis Semula AI',
		tone: 'primary',
		onHandle: async () => {
			try {
				const resp = await fetch('/api/tulis-semula', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						id: props.id,
						title: doc.title,
						content: doc.content,
						publishDate: doc.publishDate,
					}),
				})
				const json = await resp.json()
				if (!resp.ok) throw new Error(json.error || 'Gagal menulis semula')
				props.onComplete()
			} catch (e: any) {
				console.error('[Tulis Semula]', e)
			}
		},
	}
}
TulisSemulaAction.action = 'tulis-semula'
TulisSemulaAction.displayName = 'TulisSemulaAction'

export default defineConfig({
	title: 'Suara Anak Negeri',
	basePath: `/${ROUTES.studio}`,
	projectId,
	dataset,
	icon,
	schema,
	plugins: [
		structure,
		presentation,
		dashboardTool({
			name: 'info',
			title: 'Info',
			widgets: [projectInfoWidget(), projectUsersWidget(), vercelWidget()],
		}),
		visionTool({ defaultApiVersion: apiVersion }),
		codeInput(),
		media(),
		assist(),
	],
	tools: (prev) => [
		...prev,
		{ name: 'jana-berita', title: 'Jana Berita', component: JanaBeritaTool },
	],
	document: {
		actions: (prev, context) => {
			if (context.schemaType === 'blog.post') {
				return [...prev, ApproveAction, TulisSemulaAction]
			}
			return prev
		},
	},
})
