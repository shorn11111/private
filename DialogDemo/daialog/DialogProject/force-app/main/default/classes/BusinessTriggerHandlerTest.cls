@isTest
private class BusinessTriggerHandlerTest {
    /**
     * テスト設定 insert
     */
    @TestSetup
    static void setup(){
        Business__c insbus = new Business__c(
            Name = 'てすと' ,
            Status__c = '見積前',
            TotalAmount__c = 1235,
            IsApprove__c = false,
            ExpirationDate__c = Date.newInstance(2020, 12, 20)
        );
        insert insbus;
    }

    /**
     * テストケース（ 承認フラグがtrueかつ金額未入力）
     */
    @isTest
    static void test_update(){
        Business__c num = [SELECT Name,Status__c,IsApprove__c,TotalAmount__c FROM Business__c LIMIT 1];

        Test.startTest();
        try{
            num.IsApprove__c = true;
            num.TotalAmount__c = null;
            update num;
        }catch(DmlException e){
            Business__c del =[SELECT Name,Status__c,IsApprove__c,TotalAmount__c FROM Business__c LIMIT 1];
            System.assertEquals(false,del.IsApprove__c);
            System.assertEquals(1235,del.TotalAmount__c);
            System.assertEquals(true,e.getMessage().contains('合計金額が入力されていません。見積内容を確認してください'));
        }
        Test.stopTest();
    }
    /**
     * テストケース（ 承認フラグがtrueかつ金額０円のとき）
     */
    @isTest
    static void test_update2(){
        Business__c num = [SELECT Name,Status__c,IsApprove__c,TotalAmount__c FROM Business__c LIMIT 1];

        Test.startTest();
        try{
            num.IsApprove__c = true;
            num.TotalAmount__c = 0;
            update num;
        }catch(DmlException e){
            Business__c del =[SELECT Name,Status__c,IsApprove__c,TotalAmount__c FROM Business__c LIMIT 1];
            System.assertEquals(false,del.IsApprove__c);
            System.assertEquals(1235,del.TotalAmount__c);
            System.assertEquals(true,e.getMessage().contains('合計金額が入力されていません。見積内容を確認してください'));
        }
        Test.stopTest();
    }
    /**
     * テストケース（ 承認フラグがtrueかつ有効期限切れ ）
     */
    @isTest
    static void test_update3(){
        Business__c num = [SELECT Name,Status__c,IsApprove__c,ExpirationDate__c FROM Business__c LIMIT 1];
        Test.startTest();
        try{
            num.IsApprove__c = true;
            num.ExpirationDate__c = Date.newInstance(2018, 12, 20);
            update num;
        }catch(DmlException e){
            Business__c del = [SELECT Name,Status__c,IsApprove__c,ExpirationDate__c FROM Business__c LIMIT 1];
            System.assertEquals(false,del.IsApprove__c);
            System.assertEquals(true,e.getMessage().contains('有効期限が切れています。見積内容を確認してください'));
        }
        Test.stopTest();
    }
}