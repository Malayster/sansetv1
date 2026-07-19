import { useDocumentOperation, type DocumentActionComponent } from 'sanity'

/**
 * Sanity v6 native document action — ikut corak usePublishAction.
 * Guna useDocumentOperation (bukan useClient) untuk mutate status.
 */
export const ApproveAction: DocumentActionComponent = (props) => {
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

// Required by Sanity v6 document action pipeline
ApproveAction.action = 'approve'
ApproveAction.displayName = 'ApproveAction'
