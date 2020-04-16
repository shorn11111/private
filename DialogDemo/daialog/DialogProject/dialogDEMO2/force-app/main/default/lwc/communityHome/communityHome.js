import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import baseSrc from '@salesforce/resourceUrl/CommunitySrc';

const MSG_TXT_ONE = 'コミュニティポータルへようこそ！';
const MSG_TXT_TWO = '画面上部ヘッダーか、下記ボタンからお取引をご確認いただけます。';
const URL_IMG_LNK = '/img/HomeLinkButton.png';

export default class CommunityHome extends NavigationMixin(LightningElement) {
    @track imgSrc = [];
    msgTextOne = MSG_TXT_ONE;
    msgTextTwo = MSG_TXT_TWO;
    businessLink = baseSrc + URL_IMG_LNK;

    connectedCallback() {
        this.imgSrc = [
            {src: baseSrc + '/img/Slide01.jpg', lnk: 'https://www.dialog-inc.com/top/business/warehouse_management_services/about_w3/'},
            {src: baseSrc + '/img/Slide02.jpg', lnk: 'https://www.dialog-inc.com/top/business/warehouse_management_services/auto-dispatch/'},
            {src: baseSrc + '/img/Slide03.jpg', lnk: 'https://www.dialog-inc.com/top/business/warehouse_management_services/handsfreesolution/'}
        ];
    }

    /**
     * 画像リンクメニュー押下処理
     * @param {event} イベント
     */
    handleClick() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Business__c',
                actionName: 'list'
            }
        });
    }
}