import { structureTool } from 'sanity/structure'
import { DocumentIcon } from '@sanity/icons/Document'
import { ComposeIcon } from '@sanity/icons/Compose'
import { RobotIcon } from '@sanity/icons/Robot'
import { CheckmarkCircleIcon } from '@sanity/icons/CheckmarkCircle'
import { CogIcon } from '@sanity/icons/Cog'
import { VscServerProcess } from 'react-icons/vsc'
import { singleton } from './lib/builders'
import { pageDirectoriesListItem } from './lib/page-directories'
import { apiVersion } from '@/sanity/env'

export default structureTool({
	structure: (S, context) =>
		S.list()
			.title('Suara Anak Negeri')
			.items([
				S.divider(),

				// KANDUNGAN
				S.listItem()
					.title('📰 Kandungan')
					.icon(ComposeIcon)
					.child(
						S.list()
							.title('Kandungan')
							.items([
								S.listItem()
									.title('✏️ Semua Artikel')
									.icon(ComposeIcon)
									.child(
										S.documentList()
											.apiVersion(apiVersion)
											.title('Semua Artikel')
											.filter('_type == "blog.post"')
											.defaultOrdering([{ field: "publishDate", direction: "desc" }])
									),
								S.listItem()
									.title('🤖 AI Queue — Menunggu Kelulusan')
									.icon(RobotIcon)
									.child(
										S.documentList()
											.apiVersion(apiVersion)
											.title('Artikel AI Menunggu Kelulusan')
											.filter('_type == "blog.post" && status == "pending"')
											.defaultOrdering([{ field: "publishDate", direction: "desc" }])
									),
								S.listItem()
									.title('✅ Diluluskan')
									.icon(CheckmarkCircleIcon)
									.child(
										S.documentList()
											.apiVersion(apiVersion)
											.title('Artikel Diluluskan')
											.filter('_type == "blog.post" && status == "approved"')
											.defaultOrdering([{ field: "publishDate", direction: "desc" }])
									),
								S.listItem()
									.title('📁 Kategori')
									.icon(CogIcon)
									.child(
										S.documentList()
											.apiVersion(apiVersion)
											.title('Kategori')
											.filter('_type == "blog.category"')
									),
							]),
					),

				S.divider(),

				// DATA EKONOMI
				S.listItem()
					.title('📊 Data Ekonomi')
					.icon(CogIcon)
					.child(
						S.list()
							.title('Data Ekonomi')
							.items([
								S.documentTypeListItem('economicData').title('Data Ekonomi'),
								S.documentTypeListItem('governmentAchievement').title('Pencapaian Kerajaan'),
							]),
					),

				// PILIHAN RAYA
				S.listItem()
					.title('🗳️ Pilihan Raya')
					.icon(CogIcon)
					.child(
						S.list()
							.title('Pilihan Raya')
							.items([
								S.documentTypeListItem('electionInfo').title('Maklumat Pilihan Raya'),
								S.documentTypeListItem('region').title('Kawasan'),
							]),
					),

				S.divider(),

				// HALAMAN
				S.listItem()
					.title('📄 Halaman')
					.icon(DocumentIcon)
					.child(
						S.list()
							.title('Halaman')
							.items([
								S.documentTypeListItem('page').title('Semua Halaman').icon(DocumentIcon),
								pageDirectoriesListItem(S, context),
							]),
					),

				S.divider(),

				// PENGURUSAN
				S.listItem()
					.title('⚙️ Pengurusan')
					.icon(CogIcon)
					.child(
						S.list()
							.title('Pengurusan')
							.items([
								singleton(S, 'site').title('Tapak Web').icon(VscServerProcess),
								S.documentTypeListItem('global-module').title('Modul Global'),
								S.documentTypeListItem('skill').title('Kemahiran'),
								S.documentTypeListItem('person').title('Penulis'),
								S.documentTypeListItem('logo').title('Logo'),
								S.documentTypeListItem('navigation').title('Navigasi'),
								S.documentTypeListItem('redirect').title('Lencongan (Redirect)'),
								S.documentTypeListItem('form').title('Borang'),
								S.documentTypeListItem('quote').title('Petikan'),
							]),
					),

				S.divider(),

				...S.documentTypeListItems().filter(
					(item) =>
						!['site', 'global-module', 'skill', 'page', 'blog.post', 'blog.category',
							'navigation', 'redirect', 'form', 'logo', 'person', 'quote',
							'economicData', 'governmentAchievement', 'electionInfo', 'region',
							'analytics.daily', 'module-attributes', 'metadata', 'cta', 'link', 'link.list', 'megamenu', 'sidebar',
						].includes(String(item.getId() ?? '')),
				),
			]),
})
