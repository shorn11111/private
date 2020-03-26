public with sharing class importCSV {
    
    @AuraEnabled
    public static Account addAccount(String data){
        // CSVデータを分割する
        String[] csvdata = data.split(',');
        // 取引先を追加する
        Account acc = new Account();
        acc.Name = csvdata[0];
        acc.BillingState = csvdata[1];
        insert acc;
        return acc;
    }
}