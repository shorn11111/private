trigger BusinessTrigger on Business__c (before update ,after update) {
    BusinessTriggerHandler handler = new BusinessTriggerHandler();
    // before update
    if(Trigger.isUpdate && Trigger.isBefore){
        handler.OnBeforeUpdate(Trigger.new,Trigger.old);
    }
    // after update　レコード保存時、ステータス移動時に発動
    if(Trigger.isUpdate && Trigger.isAfter){
        handler.OnAfterUpdate(Trigger.new,Trigger.old);
    }
}