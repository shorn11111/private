import { LightningElement, track} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getRecords from '@salesforce/apex/businessBoard.getRecords';

const CLS_BUSINESS = 'Business__c';
const CLS_ERROR = 'レコードが見つかりません';

export default class BusinessBoard extends NavigationMixin(LightningElement) {
    @track dataArray =[];
    @track error;

    /**
     * 初期処理
     */
    connectedCallback() {
        getRecords({objName: CLS_BUSINESS})
        .then(result => {
            this.dataArray = result;
        }).catch(error => {
            this.dataArray = [];
            this.error = error;
            console.log(CLS_ERROR + ',' + this.error);
        });
    }

    /** リンク押下時のイベント */
    recodeHandleLink(evt){
        evt.preventDefault();
        evt.stopPropagation();
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes:{
                recordId: evt.target.name,
                objectApiName: CLS_BUSINESS,
                actionName: 'view'
            }
        });
    }
}