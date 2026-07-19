'use client'

/**
 * This configuration is used for the Sanity Studio mounted under `src/app/(studio)/<segment>/[[...tool]]/page.tsx`.
 * Keep `basePath` in sync with `ROUTES.studio` in `src/lib/env.ts` and the App Router folder name.
 */
// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { defineConfig, useDocumentOperation, type DocumentActionComponent } from 'sanity'
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

/** Inlined approve action — must be in this file so Turbopack bundles it for client. */
const ApproveAction: DocumentActionComponent = (props) => {
	const { id, type, draft, published, onComplete } = props
	const doc = draft || published

	if (!doc) return null
	if (type !== 'blog.post') return null
	if (!doc.aiGenerated) return null

	const { patch } = useDocumentOperation(id, type)

	return {
		label: '✅ Luluskan',
		tone: 'positive',
		disabled: doc.status !== 'pending',
		onHandle: () => {
			patch.execute([{ set: { status: 'approved' } }])
			onComplete()
		},
	}
}
ApproveAction.action = 'approve'
ApproveAction.displayName = 'ApproveAction'

export default defineConfig({
	title: 'Suara Anak Negeri',
	basePath: `/${ROUTES.studio}`,
	projectId,
	dataset,
	icon,
	// Add and edit the content schema in the './sanity/schemaTypes' folder
	schema,
	plugins: [
		structure,
		presentation,
		dashboardTool({
			name: 'info',
			title: 'Info',
			widgets: [projectInfoWidget(), projectUsersWidget(), vercelWidget()],
		}),
		// Vision is for querying with GROQ from inside the Studio
		// https://www.sanity.io/docs/the-vision-plugin
		visionTool({ defaultApiVersion: apiVersion }),
		codeInput(),
		media(),
		assist(),
	],
	document: {
		actions: (prev, context) => {
			if (context.schemaType === 'blog.post') {
				return [...prev, ApproveAction]
			}
			return prev
		},
	},
})
