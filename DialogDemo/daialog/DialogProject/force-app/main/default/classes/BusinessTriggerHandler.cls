public with sharing class BusinessTriggerHandler {

    /**
     * before update 保存ボタン押下後、自動的にステータスを完了に変更
     */
    public void OnBeforeUpdate(List<Business__c> drops , List<Business__c> olds){
        for(Business__c sel : drops){
            for(Business__c mal : olds){
                if(mal.IsApprove__c == false){
                    if(sel.IsApprove__c == true && sel.Status__c == '見積前'){
                        sel.Status__c = '見積依頼中';
                    }
                }
            }
        }
    }

    /**
     * after update 保存ボタン押下後、またはステータス変更時にエラー表示
     */
    public void OnAfterUpdate(List<Business__c> news,List<Business__c> olds2) {
        for( Business__c val : news){
            for(Business__c del : olds2){
                if(del.IsApprove__c == false){
                    if(val.IsApprove__c == true && val.ExpirationDate__c != null){
                        if(Date.today() > val.ExpirationDate__c){
                            System.debug('有効期限：' + val.ExpirationDate__c);
                            val.addError('有効期限が切れています。見積内容を確認してください');
                        }
                    }
                    if(val.IsApprove__c == true && val.TotalAmount__c == null){
                        System.debug('金額：' + val.TotalAmount__c);
                        val.addError('合計金額が入力されていません。見積内容を確認してください');
                    }else if(val.IsApprove__c == true && val.TotalAmount__c == 0) {
                        val.addError('合計金額が入力されていません。見積内容を確認してください');
                    }
                }
            }
        }
    }
}
