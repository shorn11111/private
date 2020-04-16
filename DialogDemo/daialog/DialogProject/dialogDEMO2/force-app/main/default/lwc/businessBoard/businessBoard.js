import { LightningElement,track} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getRecords from '@salesforce/apex/BusinessBoard.getRecords';

    const CLS_BUSINESS = 'Business__c';
    const CLS_RECORD_ERROR = 'レコードの取得に失敗しました';
export default class BusinessBoard extends NavigationMixin(LightningElement) {

    @track dataArray =[];
    @track bussiness = CLS_BUSINESS;
    @track error;

    /**
     * 初期処理でレコード取得
     */
        connectedCallback() {
            getRecords({
                objName: this.bussiness
            })
            .then(result => {
                this.dataArray = result;
                console.log('dataArray :' + JSON.stringify(this.dataArray));
            })
            .catch(error => {
                this.dataArray = [];
                this.error = CLS_RECORD_ERROR;
                console.log(CLS_RECORD_ERROR + ',' + JSON.stringify(error));
            });
        }
        /**
         * リンククリック時レコード画面に遷移
         * @param {handleLink} evt
         */
        handleLink(evt){
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes:{
                    recordId: evt.target.name,
                    objectApiName: CLS_BUSINESS,
                    actionName: 'view'
                }
            })
        }
}