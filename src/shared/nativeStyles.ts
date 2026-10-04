// Layout only. Steam's components own fonts, surfaces, buttons and focus states.
export const nativeStyles = `
.orbiter{box-sizing:border-box;min-width:0;background:transparent;color:inherit}
.orbiter h1{font:inherit;font-weight:600;margin:0}.orbiter h2{font:inherit;font-weight:600;margin:0 0 8px}.orbiter p{margin:6px 0 12px}
.orbiter .orb-head,.orbiter .orb-flex{display:flex;align-items:center;justify-content:space-between;gap:8px}.orbiter .orb-head{margin-bottom:12px}.orbiter .orb-brand{display:flex;align-items:center;gap:8px}
.orbiter .orb-button{box-sizing:border-box;min-width:0!important;max-width:100%;width:100%;white-space:normal}
.orbiter .orb-status{display:flex;gap:6px;align-items:center}.orbiter .orb-dot{width:5px;height:5px;border-radius:50%;background:currentColor;flex:none}.orbiter .idle{opacity:.5}.orbiter .orb-tag,.orbiter .orb-map,.orbiter .orb-small,.orbiter .orb-subtitle,.orbiter .orb-footnote{font-size:12px;opacity:.75}
.orbiter .orb-tabs{display:flex;gap:8px;margin:12px 0}.orbiter .orb-tabs>*{flex:1;min-width:0}.orbiter .orb-section{margin:12px 0}.orbiter .orb-section-head{display:flex;justify-content:space-between;align-items:center}
.orbiter .orb-row{display:flex;gap:8px;align-items:center;padding:6px 0;line-height:1.25}.orbiter .orb-condition-icon{width:24px;height:28px;object-fit:contain;flex:none}.orbiter .orb-fallback{width:24px;flex:none;text-align:center}.orbiter .orb-details{flex:1;min-width:0}.orbiter .orb-name{font-size:14px;font-weight:600;overflow-wrap:anywhere}.orbiter .orb-map{margin-top:3px}.orbiter .orb-time{text-align:right;white-space:nowrap;font-size:12px;font-variant-numeric:tabular-nums}.orbiter .orb-time strong{display:block}.orbiter .orb-time small{font-size:10px}
.orbiter .orb-footer{margin-top:18px}.orbiter .orb-footer>.orb-button{width:100%}.orbiter .orb-footer>.orb-button+.orb-flex{margin-top:10px}.orbiter .orb-footer .orb-flex>.orb-button{flex:1}.orbiter .orb-footnote{display:flex;justify-content:space-between;gap:8px;margin-top:12px}.orbiter .orb-back{margin-bottom:16px}.orbiter .orb-empty,.orbiter .orb-message{padding:12px 0}.orbiter .orb-setting{margin:14px 0}.orbiter .orb-manage{width:100%;margin-top:8px}
 .orbiter .orb-condition-list{margin-top:8px}.orbiter .orb-condition-choice{margin-bottom:0}.orbiter .orb-condition-actions{display:flex;align-items:center;gap:4px;flex:none}.orbiter .orb-native-item{min-width:0;padding:4px 0}.orbiter .orb-choice-name{font-size:14px;font-weight:600;line-height:1.25;overflow-wrap:anywhere}.orbiter .orb-choice-summary{font-size:11px;line-height:1.25;opacity:.75;overflow-wrap:anywhere}.orbiter .orb-selection-mark{flex:none}.orbiter .orb-disclosure-slot{display:flex;align-items:center;justify-content:center;width:32px;height:32px}.orbiter .orb-chevron{width:14px;height:14px;display:block}.orbiter .orb-chevron.open{transform:rotate(180deg)}
.orbiter .orb-map-options{display:flex;flex-direction:column;gap:6px;padding:12px 0}.orbiter .orb-map-options .orb-button{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;white-space:normal}.orbiter .orb-filter-list{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}.orbiter .orb-support{font-size:12px}.orbiter.orb-wide{max-width:980px;margin:auto;padding:24px}.orbiter.orb-wide .orb-columns{display:grid;grid-template-columns:1fr 1fr;gap:24px}.orbiter .orb-setup-title{margin-top:20px}
@media(max-width:650px){.orbiter.orb-wide .orb-columns{display:block}}
.orbiter .orb-flex>.orb-button,.orbiter .orb-tabs>.orb-button{width:0;flex:1 1 0!important;min-width:0!important}
.orbiter .orb-tabs{align-items:stretch}.orbiter .orb-back{width:auto}
.orbiter .orb-footnote{flex-wrap:wrap}
.orbiter .orb-message{overflow-wrap:anywhere}
.orbiter .orb-inline-choice{margin:0}.orbiter .orb-inline-choice-trigger,.orbiter .orb-inline-choice-option{display:flex;align-items:center;justify-content:space-between;gap:8px}
.orbiter .orb-inline-choice-options{display:flex;flex-direction:column;gap:6px;margin-top:8px}.orbiter .orb-inline-choice-trigger .orb-disclosure-slot{width:16px;height:16px;flex:0 0 16px}
.orbiter .orb-page-head{display:flex;align-items:center;gap:10px;margin-bottom:16px}.orbiter .orb-page-head .orb-back{margin:0}.orbiter .orb-page-head h1{flex:1;min-width:0}.orbiter .orb-page-head .orb-support{width:auto}
.orbiter .orb-status{min-width:0;flex:1;flex-wrap:wrap}.orbiter .orb-tag{flex:none}.orbiter .orb-footnote{line-height:1.4}.orbiter .orb-setup-title{margin-top:0}
/* Geometry only: Steam still owns surfaces, focus rings and toggle internals. */
.orbiter .orb-button.orb-star,.orbiter .orb-button.orb-icon-button,.orbiter .orb-button.orb-map-expander,.orbiter .orb-page-head .orb-button.orb-back{box-sizing:border-box!important;width:32px!important;min-width:32px!important;max-width:32px!important;height:32px!important;min-height:32px!important;max-height:32px!important;flex:0 0 32px!important;padding:0!important;display:flex;align-items:center;justify-content:center}
.orbiter .orb-test-notification{margin:8px 0}
.orbiter .orb-schedule-filters{display:grid;grid-template-columns:minmax(160px,1fr) minmax(220px,1.4fr) minmax(190px,1fr);gap:16px;align-items:start;margin:16px 0 6px;max-width:850px}
.orbiter .orb-schedule-filters .orb-tabs,.orbiter .orb-schedule-filters .orb-inline-choice{margin:0}
.orbiter .orb-schedule-filters h2{font-size:12px;margin:0 0 6px}
.orbiter .orb-schedule-filters .orb-button{height:38px!important;min-height:38px!important;padding:0 10px!important;line-height:1.2}.orbiter .orb-schedule-filters .orb-tabs .orb-button{display:flex;align-items:center;justify-content:center}
.orbiter .orb-schedule-map{min-width:0}
.orbiter .orb-schedule-map .orb-inline-choice-options{max-height:176px;overflow-y:auto;overscroll-behavior:contain;padding:4px;margin:6px -4px 0;scroll-padding:4px}
.orbiter .orb-schedule-map .orb-inline-choice-option{flex:none;min-height:38px;text-align:left}
.orbiter .orb-local-times{margin:6px 0 0;font-size:11px}
@media(max-width:700px){.orbiter .orb-schedule-filters{grid-template-columns:1fr;gap:10px}}
.orbiter .orb-about-actions{display:flex;flex-direction:column;gap:8px;margin-top:12px}.orbiter .orb-about-actions>.orb-button{width:100%}.orbiter .orb-about-author{font-size:13px;line-height:1.5}
`;
