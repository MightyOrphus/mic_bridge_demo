import { Injectable } from '@nestjs/common';

@Injectable()
export class NavSoapService {
  createReadMultipleCustomerXml(setSize: number = 50, bookmarkKey: string = ''): string {
    return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cust="urn:microsoft-dynamics-schemas/page/customer">
   <soapenv:Header/>
   <soapenv:Body>
      <cust:ReadMultiple>
         <cust:bookmarkKey>${bookmarkKey}</cust:bookmarkKey>
         <cust:setSize>${setSize}</cust:setSize>
      </cust:ReadMultiple>
   </soapenv:Body>
</soapenv:Envelope>`.trim();
  }

  createReadMultipleItemXml(setSize: number = 50, bookmarkKey: string = ''): string {
    return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:item="urn:microsoft-dynamics-schemas/page/item">
   <soapenv:Header/>
   <soapenv:Body>
      <item:ReadMultiple>
         <item:bookmarkKey>${bookmarkKey}</item:bookmarkKey>
         <item:setSize>${setSize}</item:setSize>
      </item:ReadMultiple>
   </soapenv:Body>
</soapenv:Envelope>`.trim();
  }

  createReadMultipleItemCategoryXml(setSize: number = 100, bookmarkKey: string = ''): string {
    return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cat="urn:microsoft-dynamics-schemas/page/itemcategory">
   <soapenv:Header/>
   <soapenv:Body>
      <cat:ReadMultiple>
         <cat:bookmarkKey>${bookmarkKey}</cat:bookmarkKey>
         <cat:setSize>${setSize}</cat:setSize>
      </cat:ReadMultiple>
   </soapenv:Body>
</soapenv:Envelope>`.trim();
  }

  createReadMultiplePOXml(setSize: number = 50, bookmarkKey: string = ''): string {
    return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pur="urn:microsoft-dynamics-schemas/page/purchaseorder">
   <soapenv:Header/>
   <soapenv:Body>
      <pur:ReadMultiple>
         <pur:bookmarkKey>${bookmarkKey}</pur:bookmarkKey>
         <pur:setSize>${setSize}</pur:setSize>
      </pur:ReadMultiple>
   </soapenv:Body>
</soapenv:Envelope>`.trim();
  }

  createItemXml(itemData: any): string {
    return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:item="urn:microsoft-dynamics-schemas/page/item">
   <soapenv:Header/>
   <soapenv:Body>
      <item:Create>
         <item:Item>
            <item:No>${itemData.No || ''}</item:No>
            <item:Description>${itemData.Description || ''}</item:Description>
            <item:Base_Unit_of_Measure>${itemData.Base_Unit_of_Measure || ''}</item:Base_Unit_of_Measure>
            <item:Sales_Unit_of_Measure>${itemData.Sales_Unit_of_Measure || ''}</item:Sales_Unit_of_Measure>
            <item:Item_Category_Code>${itemData.Item_Category_Code || ''}</item:Item_Category_Code>
            <item:Product_Group_Code>${itemData.Product_Group_Code || ''}</item:Product_Group_Code>
            <item:Brand>${itemData.Brand || ''}</item:Brand>
            <item:Unit_Price>${itemData.Unit_Price || 0}</item:Unit_Price>
            <item:Unit_Cost>${itemData.Unit_Cost || 0}</item:Unit_Cost>
            <item:Gen_Prod_Posting_Group>${itemData.Gen_Prod_Posting_Group || ''}</item:Gen_Prod_Posting_Group>
            <item:VAT_Prod_Posting_Group>${itemData.VAT_Prod_Posting_Group || ''}</item:VAT_Prod_Posting_Group>
            <item:WHT_Product_Posting_Group>${itemData.WHT_Product_Posting_Group || ''}</item:WHT_Product_Posting_Group>
            <item:Inventory_Posting_Group>${itemData.Inventory_Posting_Group || ''}</item:Inventory_Posting_Group>
         </item:Item>
      </item:Create>
   </soapenv:Body>
</soapenv:Envelope>`.trim();
  }

  updateItemXml(itemData: any): string {
    return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:item="urn:microsoft-dynamics-schemas/page/item">
   <soapenv:Header/>
   <soapenv:Body>
      <item:Update>
         <item:Item>
            <item:Key>${itemData.Key}</item:Key>
            <item:No>${itemData.No || ''}</item:No>
            <item:Description>${itemData.Description || ''}</item:Description>
            <item:Base_Unit_of_Measure>${itemData.Base_Unit_of_Measure || ''}</item:Base_Unit_of_Measure>
            <item:Sales_Unit_of_Measure>${itemData.Sales_Unit_of_Measure || ''}</item:Sales_Unit_of_Measure>
            <item:Item_Category_Code>${itemData.Item_Category_Code || ''}</item:Item_Category_Code>
            <item:Product_Group_Code>${itemData.Product_Group_Code || ''}</item:Product_Group_Code>
            <item:Brand>${itemData.Brand || ''}</item:Brand>
            <item:Unit_Price>${itemData.Unit_Price || 0}</item:Unit_Price>
            <item:Unit_Cost>${itemData.Unit_Cost || 0}</item:Unit_Cost>
            <item:Gen_Prod_Posting_Group>${itemData.Gen_Prod_Posting_Group || ''}</item:Gen_Prod_Posting_Group>
            <item:VAT_Prod_Posting_Group>${itemData.VAT_Prod_Posting_Group || ''}</item:VAT_Prod_Posting_Group>
            <item:WHT_Product_Posting_Group>${itemData.WHT_Product_Posting_Group || ''}</item:WHT_Product_Posting_Group>
            <item:Inventory_Posting_Group>${itemData.Inventory_Posting_Group || ''}</item:Inventory_Posting_Group>
         </item:Item>
      </item:Update>
   </soapenv:Body>
</soapenv:Envelope>`.trim();
  }

  createPOXml(poData: any): string {
    return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pur="urn:microsoft-dynamics-schemas/page/purchaseorder">
   <soapenv:Header/>
   <soapenv:Body>
      <pur:Create>
         <pur:PurchaseOrder>
            <pur:Buy_from_Vendor_No>${poData.Buy_from_Vendor_No || ''}</pur:Buy_from_Vendor_No>
            <pur:Order_Date>${poData.Order_Date || ''}</pur:Order_Date>
            <pur:Posting_Description>${poData.Description || ''}</pur:Posting_Description>
         </pur:PurchaseOrder>
      </pur:Create>
   </soapenv:Body>
</soapenv:Envelope>`.trim();
  }
}
