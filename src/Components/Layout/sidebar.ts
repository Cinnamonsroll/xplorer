import fs from 'fs';
import storage from 'electron-json-storage-sync';
import fileThumbnail from '../Thumbnail/thumbnail';
import { sidebarDrivesElement } from '../Drives/drives';
import { updateTheme } from '../Theme/theme';
import Translate from '../I18n/i18n';
import Setting from '../Setting/setting';
import { default as getPath } from 'platform-folders';

interface Favorites {
	name: string;
	path: string;
}

const changeSidebar = (newElement: HTMLElement) => {
	const sidebarElement = document.body.querySelector('.sidebar');
	sidebarElement.parentElement.replaceChild(newElement, sidebarElement);
	updateTheme();
	return;
};

/**
 * Sidebar initializer function
 * @returns {void}
 */
const createSidebar = (): void => {
	const { data } = storage.get('sidebar'); // Get user favorites data on sidebar
	// Functions to get favorites element
	const getFavoritesElement = (favorites: Favorites[]) => {
		let favoritesElement = '';
		const sidebarElementFavorites = [
			'Home',
			'Recent',
			'Documents',
			'Desktop',
			'Downloads',
			'Pictures',
			'Music',
			'Videos',
			'Trash',
		];
		for (const favorite of favorites) {
			let isdir;
			try {
				isdir = fs.lstatSync(favorite.path).isDirectory();
			} catch (_) {
				isdir = true;
			}
			favoritesElement += `<span data-path = "${
				favorite.path
			}" data-isdir="${isdir}" class="sidebar-hover-effect sidebar-item"><img src="${fileThumbnail(
				favorite.name,
				sidebarElementFavorites.indexOf(favorite.name) === -1
					? isdir
						? 'folder'
						: 'file'
					: 'sidebar',
				false
			)}" alt="${
				favorite.name
			} icon"><span class="sidebar-text">${Translate(
				favorite.name
			)}</span></span>`;
		}
		const result = `<div class="sidebar-nav-item ${
			data?.hideSection?.favorites ? 'nav-hide-item' : ''
		}">
        <div class="sidebar-hover-effect">
            <span class="sidebar-nav-item-dropdown-btn" data-section="favorites"><img src="${fileThumbnail(
				'Favorites',
				'sidebar',
				false
			)}" alt="Favorites icon"><span class="sidebar-text">${Translate(
			'Favorites'
		)}</span><div class="sidebar-nav-item-dropdown-spacer"></div></span>
        </div>
        <div class="sidebar-nav-item-dropdown-container">
            ${favoritesElement}
        </div>
        </div>`;
		return result;
	};

	const _favorites = data?.favorites ?? [
		{ name: 'Home', path: 'xplorer://Home' },
		{ name: 'Recent', path: 'xplorer://Recent' },
		{ name: 'Desktop', path: `${getPath('desktop')}` },
		{ name: 'Documents', path: `${getPath('documents')}` },
		{ name: 'Downloads', path: `${getPath('downloads')}` },
		{ name: 'Pictures', path: `${getPath('pictures')}` },
		{ name: 'Music', path: `${getPath('music')}` },
		{ name: 'Videos', path: `${getPath('videos')}` },
		{ name: 'Trash', path: 'xplorer://Trash' },
	];

	sidebarDrivesElement().then((drivesElement) => {
		// get drives element
		const sidebarNavElement = document.querySelector(
			'#sidebar-nav'
		) as HTMLDivElement;
		sidebarNavElement.innerHTML = `
			${getFavoritesElement(_favorites)}
			${drivesElement}
		`;

		const sidebarElement = document.querySelector(
			'.sidebar'
		) as HTMLDivElement;

		const settingBtn = document.querySelector('.sidebar-setting-btn');
		settingBtn.innerHTML = `
		<div class="sidebar-setting-btn-inner">
			<img src="${fileThumbnail(
				'setting',
				'sidebar',
				false
			)}" alt="Setting icon" class="sidebar-setting-btn-icon" />

			<span class="sidebar-setting-btn-text">
				${Translate('Settings')}
			</span>
		</div>`;

		// Collapse section
		sidebarElement
			.querySelectorAll('.sidebar-nav-item-dropdown-btn')
			.forEach((btn) => {
				btn.addEventListener('click', (e) => {
					let sidebarNavItem = (e.target as Element).parentNode;
					while (
						!(sidebarNavItem as HTMLElement).classList.contains(
							'sidebar-nav-item'
						)
					) {
						sidebarNavItem = sidebarNavItem.parentNode;
					}
					(sidebarNavItem as HTMLElement).classList.toggle(
						'nav-hide-item'
					);

					// Save preference into local storage
					const sidebar = storage.get('sidebar')?.data ?? {};
					if (!sidebar.hideSection) sidebar.hideSection = {}; // Initialize if it's not exist
					sidebar.hideSection[
						(e.target as HTMLElement).dataset.section
					] = (
						(e.target as Element).parentNode
							.parentNode as HTMLElement
					).classList.contains('nav-hide-item');
					storage.set('sidebar', sidebar);
				});
			});
		changeSidebar(sidebarElement);
		Setting();
	});
};

export default createSidebar;
