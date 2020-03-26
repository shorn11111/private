import { LightningElement, track, api } from 'lwc';
/* 定数 */
const CLS_ALERT_THEME = 'slds-notify slds-notify_alert slds-theme_alert-texture slds-m-bottom--x-small custom slds-theme_';
const CLS_ICON_UTIL = 'slds-m-horizontal_small slds-no-flex slds-icon_container slds-icon-utility-';
const CLS_BTN_CLOSE = 'slds-notify__close slds-m-left_small';
const CLS_BTN_HIDE = 'slds-hide';
const ICO_NAME_UTIL = 'utility:';
const STR_DEFAULT = 'success';

export default class CustomBanner extends LightningElement {

    @api isBigtext = false;
    @api isCloseable = false;
    @track isVisible = false;
    @track msgBody = '';
    @track msgType = STR_DEFAULT;
    @track clsAlertTheme = CLS_ALERT_THEME + STR_DEFAULT;
    @track clsIconUtil = CLS_ICON_UTIL + STR_DEFAULT;
    @track clsBtnClose = CLS_BTN_CLOSE;
    @track icoNameUtil = ICO_NAME_UTIL + STR_DEFAULT;

    /**
     * 表示更新処理
     */
    updateDisp() {
        if(this.msgType){
            this.icoNameUtil = ICO_NAME_UTIL + this.msgType;
            this.clsBtnClose = this.isCloseable ? '' : CLS_BTN_HIDE;
            if(this.msgBody){
                this.clsAlertTheme = CLS_ALERT_THEME + this.msgType;
                this.clsIconUtil = CLS_ICON_UTIL + this.msgType;
                this.isVisible = true;
            }else{
                console.log('メッセージ本文が指定されていません');
                this.isVisible = false;
            }
        }else{
            console.log('メッセージタイプが指定されていません');
            this.isVisible = false;
        }
    }

    /**
     * バナー表示
     * param  {argMsg} メッセージ本文
     * param  {argType} メッセージタイプ
     */
    @api doOpen(argMsg, argType) {
        this.msgBody = argMsg;
        this.msgType = argType;
        this.updateDisp();
    }

    /**
     * バナー非表示
     */
    @api doClose() {
        this.isVisible = false;
    }
}