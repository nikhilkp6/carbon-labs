/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint jsdoc/require-jsdoc: 0, react-hooks/rules-of-hooks: 0 */

import { LitElement, css, html, nothing, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { settings } from '@carbon-labs/utilities';
import '@carbon/web-components/es-custom/components/ui-shell/index.js';
import '@carbon/web-components/es-custom/components/popover/index.js';
import { HeaderProps } from '../../types/Header.types';
import {
  AUTOMATION_NAMESPACE_PREFIX,
  APP_SWITCHER_BUTTON_ID,
} from '../../constant';
/* c8 ignore next */
import cx from 'classnames';
import styles from './_index.scss?inline';
import './WideSideNav';
import '../SideNavItem/SideNavItem';
import '../HeaderContext/HeaderContext';
import useScript from '../../globals/useScript';
import loadSidekickScript from '../../globals/loadSidekickScript';
import loadSolisScript from '../../globals/loadSolisScript';

const { stablePrefix: clabsPrefix } = settings;

/**
 * Main global header component
 */
@customElement(`${clabsPrefix}-global-header-apaas`)
export class CommonHeader extends LitElement {
  createRenderRoot() {
    return super.createRenderRoot(); // Default Shadow DOM behavior
  }
  static styles = css`
    ${unsafeCSS(styles)}
  `;

  @property({ type: Object })
  headerProps: HeaderProps = {};

  @property({ type: Boolean }) hasNewNotifications = false;

  @state()
  private isMenuOpen = false;

  @state()
  assistMeScriptLoaded = false;

  @state()
  sidekickScriptLoaded = false;

  @state()
  solisScriptLoaded = false;

  handleNavItemClick = (e: Event) => {
    if (this.headerProps?.sideNav?.onClick) {
      this.headerProps?.sideNav?.onClick?.(e);
    }
  };

  connectedCallback() {
    super.connectedCallback();
    if (this.headerProps.assistMeConfigs) {
      useScript(this.headerProps);

      document.addEventListener('assist-me-script-status', ((
        e: CustomEvent
      ) => {
        if (e.detail?.message && e.detail?.message === 'load') {
          this.assistMeScriptLoaded = true;
        } else if (e.detail?.message && e.detail?.message === 'error') {
          console.error(
            'An error occurred trying to load the assistMe script.'
          );
        }
      }) as EventListener);
    }
    if (
      this.headerProps.sidekickConfig &&
      this.headerProps.sidekickConfig.isEnabled
    ) {
      loadSidekickScript(this.headerProps);

      document.addEventListener('sidekick-script-status', ((e: CustomEvent) => {
        if (
          e.detail?.message &&
          e.detail?.message === 'load' &&
          this.headerProps.sidekickConfig
        ) {
          this.sidekickScriptLoaded = true;
        } else if (e.detail?.message && e.detail?.message === 'error') {
          console.error(
            'An error occurred trying to load the sidekick script.'
          );
        }
      }) as EventListener);
    }
    if (
      this.headerProps.solisConfig &&
      this.headerProps.solisConfig.isEnabled
    ) {
      loadSolisScript(this.headerProps);

      document.addEventListener('solis-script-status', ((e: CustomEvent) => {
        if (
          e.detail?.message &&
          e.detail?.message === 'load' &&
          this.headerProps.solisConfig
        ) {
          this.solisScriptLoaded = true;
        } else if (e.detail?.message && e.detail?.message === 'error') {
          console.error('An error occurred trying to load the solis script.');
        }
      }) as EventListener);
    }
  }

  disconnectedCallback() {
    this.removeEventListener('assist-me-script-status', () => {});
    this.removeEventListener('sidekick-script-status', () => {});
    this.removeEventListener('solis-script-status', () => {});
    super.disconnectedCallback();
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (
      this.headerProps.assistMeConfigs &&
      changedProperties.has('headerProps')
    ) {
      useScript(this.headerProps);
    }
    if (
      this.headerProps.sidekickConfig?.isEnabled &&
      changedProperties.has('headerProps')
    ) {
      loadSidekickScript(this.headerProps);
    }
    if (
      this.headerProps.solisConfig?.isEnabled &&
      changedProperties.has('headerProps')
    ) {
      loadSolisScript(this.headerProps);
    }
  }

  render() {
    return html`
      <cds-custom-header
        class="${AUTOMATION_NAMESPACE_PREFIX}__header"
        aria-label="IBM webMethods Hybrid Integration">
        ${(this.headerProps?.sideNav || this.headerProps?.headerNavigation?.items?.length )
          ? html`
              <cds-custom-header-menu-button
                class="${cx({ [`${AUTOMATION_NAMESPACE_PREFIX}__header-menu-button`]: this.headerProps?.headerNavigation?.items?.length })}"
                id="${APP_SWITCHER_BUTTON_ID}"
                button-label-active="Close menu"
                button-label-inactive="Open menu"></cds-custom-header-menu-button>
            ` : nothing }
        <a
          href="${this?.headerProps?.brand?.href}"
          class="${AUTOMATION_NAMESPACE_PREFIX}__header-name">
          <cds-custom-header-name
            class="${AUTOMATION_NAMESPACE_PREFIX}__header-name"
            prefix="${this.headerProps?.brand?.company ?? 'IBM'}">
            <span class="${AUTOMATION_NAMESPACE_PREFIX}__product-type"
              >${this.headerProps?.brand?.product ?? nothing}</span
            >
          </cds-custom-header-name>
        </a>
        <span class="${AUTOMATION_NAMESPACE_PREFIX}__capability-name"
          >${this.headerProps?.capabilityName?.label ?? nothing}</span
        >
        <!-- ADD NAVIGATION HERE -->
        ${this.headerProps?.headerNavigation?.items?.length
          ? html`
              <nav 
                aria-label="${this.headerProps.headerNavigation.ariaLabel ?? 'Navigation'}"
                class="${AUTOMATION_NAMESPACE_PREFIX}__header__nav">
                <ul class="${AUTOMATION_NAMESPACE_PREFIX}__header__menu-bar">
                  ${this.headerProps.headerNavigation.items.map((item) => html`
                    <li>
                      <a
                        href="${item.href}"
                        ?aria-current="${item.isActive}"
                        class="${cx(
                          `${AUTOMATION_NAMESPACE_PREFIX}__header__menu-item`,
                          {
                            [`${AUTOMATION_NAMESPACE_PREFIX}__header__menu-item--current`]: item.isActive
                          }
                        )}"
                        @click="${(e: Event) => {
                          if (item.onClick) {
                            item.onClick(e);
                          }
                        }}"
                        tabindex="0">
                        <span class="${AUTOMATION_NAMESPACE_PREFIX}__text-truncate--end">
                          ${item.label}
                        </span>
                      </a>
                    </li>
                  `)}
                </ul>
              </nav>
            `
          : nothing}
        <clabs-global-header-context
          class="${AUTOMATION_NAMESPACE_PREFIX}__global"
          .props="${{ ...this.headerProps }}"
          .assistMeScriptLoaded="${this.assistMeScriptLoaded}"
          ?hasNewNotifications="${this
            .hasNewNotifications}"></clabs-global-header-context>
        ${this.headerProps && (this.headerProps?.sideNav || this.headerProps?.headerNavigation?.items?.length)
          ? html`
              <clabs-global-header-wide-side-nav
                aria-label=${this.headerProps?.sideNav?.buttonLabel ??
                'Side navigation'}
                collapse-mode="${this.headerProps?.sideNav && typeof this.headerProps.sideNav
                  .isCollapsible !== 'undefined' &&
                this.headerProps.sideNav.isCollapsible
                  ? 'rail'
                  : 'responsive'}"
                ?is-not-persistent="${this.headerProps?.sideNav && typeof this.headerProps.sideNav
                  .isCollapsible !== 'undefined' &&
                this.headerProps.sideNav.isCollapsible
                  ? true
                  : false}"
                class="${cx({
                  [`${AUTOMATION_NAMESPACE_PREFIX}--rail-sidePanel`]:
                    this.headerProps?.sideNav && typeof this.headerProps.sideNav.isCollapsible !==
                      'undefined' && !this.headerProps.sideNav.isCollapsible,
                  [`${AUTOMATION_NAMESPACE_PREFIX}--side-nav-with-header-nav`]:
                    this.headerProps?.headerNavigation?.items?.length
                })}">
                <cds-custom-side-nav-items
                  class="${AUTOMATION_NAMESPACE_PREFIX}__side-nav-items">
                  <!-- Header navigation items (shown in side nav on mobile) -->
                  ${this.headerProps?.headerNavigation?.items?.length
                    ? html`
                        ${this.headerProps.headerNavigation.items.map((navItem) => html`
                          <clabs-global-header-side-nav-item
                            .link="${{
                              href: navItem?.href,
                              label: navItem?.label,
                              isActive: navItem?.isActive,
                              onClick: navItem?.onClick,
                              sideNavMenuItems: []
                            }}"
                            .isCollapsible="${this.headerProps.sideNav?.isCollapsible}"
                            .handleNavItemClick="${(e: Event) => {
                              if (navItem.onClick) {
                                navItem.onClick(e);
                              }
                            }}"
                            .isSideNavMenuItems="${false}"
                            .isActive="${navItem.isActive ?? false}"
                            .menuOpen="${this.isMenuOpen}"
                            .isOnClickAvailable="${typeof navItem.onClick === 'function'}">
                          </clabs-global-header-side-nav-item>
                        `)}
                      `
                    : nothing}
                  <!-- sideNav group array render  -->
                  ${this.headerProps?.sideNav?.groups
                    ? html`
                        ${this.headerProps.sideNav?.groups?.map(
                          (group, index, { length }) => {
                            // Loop through the group array in order to access the links
                            const numberOfGroups = length;
                            return html`
                              ${group?.links?.map((link, key, { length }) => {
                                // Loop through the links array to render the menu items
                                return html`
                                  <clabs-global-header-side-nav-item
                                    .link="${{ ...link }}"
                                    ?isCollapsible="${this.headerProps.sideNav
                                      ?.isCollapsible}"
                                    .handleNavItemClick="${this
                                      .handleNavItemClick}"
                                    .isSideNavMenuItems="${link.isSideNavMenuItems}"
                                    ?isActive="${this.headerProps
                                      .isHybridIpaas && !link.isSideNavMenuItems
                                      ? window.location.href.includes(link.href)
                                      : link.isActive}"
                                    ?menuOpen="${this.isMenuOpen}"
                                    ?isOnClickAvailable="${typeof this
                                      .headerProps?.sideNav?.onClick ===
                                    'function'}"
                                    ?isHybridIpaas="${this.headerProps
                                      .isHybridIpaas}">
                                  </clabs-global-header-side-nav-item>
                                  ${
                                    // do not add a divider after the final group
                                    index + 1 !== numberOfGroups &&
                                    key + 1 === length
                                      ? html`<cds-custom-side-nav-divider></cds-custom-side-nav-divider>`
                                      : nothing
                                  }
                                `;
                              })}
                            `;
                          }
                        )}
                      `
                    : nothing}

                  <!-- sideNav link render -->
                  ${this.headerProps?.sideNav?.links &&
                  this.headerProps.sideNav.links.length > 0
                    ? html`
                        ${this.headerProps.sideNav?.links?.map((link) => {
                          // Loop through the links array to render the menu items
                          return html`
												<clabs-global-header-side-nav-item
												.link="${{ ...link }}"
												.isCollapsible="${this.headerProps.sideNav?.isCollapsible}"
												.handleNavItemClick="${this.handleNavItemClick}"
												.isSideNavMenuItems="${link.isSideNavMenuItems}"
												.isActive="${link.isActive}"
												.menuOpen="${this.isMenuOpen}"
												.isOnClickAvailable="${
                          typeof this.headerProps?.sideNav?.onClick ===
                          'function'
                        }">
												</clabs-global-header-side-nav-item>
                                </cds-custom-side-nav-menu>
                              `;
                        })}
                      `
                    : nothing}
                </cds-custom-side-nav-items>
              </clabs-global-header-wide-side-nav>
            `
          : nothing}
        ${this.headerProps && this.headerProps.sideNavPropsV2
          ? html`<cds-custom-side-nav
              aria-label=${this.headerProps?.sideNavPropsV2?.buttonLabel ??
              'Side navigation'}
              collapse-mode="rail"
              ?expanded="${typeof this.headerProps.sideNavPropsV2
                .isExpandable !== 'undefined' &&
              this.headerProps.sideNavPropsV2.isExpandable
                ? this.isMenuOpen
                : false}"
              ?is-not-persistent="${typeof this.headerProps?.sideNavPropsV2
                ?.isCollapsible !== 'undefined' &&
              !this.headerProps?.sideNav?.isCollapsible
                ? false
                : true}"
              class="
							${cx({
                [`${AUTOMATION_NAMESPACE_PREFIX}--rail-sidePanel`]:
                  typeof this.headerProps.sideNavPropsV2.isCollapsible !==
                    'undefined' &&
                  !this.headerProps.sideNavPropsV2.isCollapsible,
              })}">
              ${this.headerProps.sideNavPropsV2?.links?.map((link) => {
                // Loop through the links array to render the menu items
                return html`
									<clabs-global-header-side-nav-item
									.link="${{ ...link }}"
									.isCollapsible="${this.headerProps.sideNavPropsV2?.isCollapsible}"
									.handleNavItemClick="${this.handleNavItemClick}"
									.isSideNavMenuItems="${link.isSideNavMenuItems}"
									.isActive="${link.isActive}"
									.menuOpen="${this.isMenuOpen}"
									.isOnClickAvailable="${
                    typeof this.headerProps?.sideNavPropsV2?.onClick ===
                    'function'
                  }"
									>
									</clabs-global-header-side-nav-item>
                </cds-custom-side-nav-menu>
                `;
              })}
            </cds-custom-side-nav>`
          : nothing}
      </cds-custom-header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'common-header': CommonHeader;
  }
}
