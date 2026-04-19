**GLEUHR**

Airtable CRM

Complete Field-by-Field Analysis & Data Source Documentation

Covers: Team, Appointments, Orders, Products, OTP, Packages,
Installments

February 2026 \| Confidential

**Table of Contents**

1\. System Architecture & Cross-Base Data Flow

1.1 Working Bases --- Two-Base Architecture

1.2 Data Source Categories

1.3 Core Data Flow

1.4 Lookup Cascade Patterns

1.5 Archive Bases --- Record Preservation Strategy

2\. Team Table --- Field Analysis (89 fields)

3\. New Appointments Table --- Field Analysis (154 fields)

4\. Orders Table --- Field Analysis (120+ fields)

5\. Products Table --- Field Analysis (23 fields)

6\. OTP Table --- Field Analysis (89 fields, Clinic Base)

7\. Packages Table --- Field Analysis (67 fields, Clinic Base)

8\. Installments Table --- Field Analysis (130 fields, Clinic Base)

9\. Cross-Table Relationships & Lookup Chains

10\. Formula Dependencies Map

11\. Revenue Attribution Data Flow

12\. (S) Snapshot Fields --- Record Deletion Protocol

13\. Automation Triggers & Integration Points

**1. System Architecture & Cross-Base Data Flow**

**1.1 Working Bases --- Two-Base Architecture**

Gleuhr\'s CRM spans two separate Airtable accounts as its active working
environment. The Gleuhr Base (Account 1, MCP-connected) manages the
customer lifecycle, online sales, team directory, and support. The
Clinic Base (Account 2, separate) handles clinic-side transactions:
one-time purchases (OTP), multi-session packages, and installment
payments.

Three tables --- Contacts, Team, and Appointments --- are natively
synced between the two working bases using Airtable\'s built-in sync
feature. The Appointments table serves as the primary bridge, with its
Appointment ID (format: PhoneNumber - (AutoNumber)) acting as the
universal cross-base identifier.

To stay within Airtable\'s 1.25 lakh (125,000) record limit per base,
completed records are periodically deleted from the working bases after
being preserved in archive bases (see Section 1.5).

**1.2 Data Source Categories**

Every field in the system falls into one of these data source
categories:

  ------------- ------------------------ ---------------------------------
  **Source      **How It Works**         **Example Fields**
  Type**                                 

  Manual Entry  Data entered directly by Clinic, Payment Mode, Discount %,
                a team member via        Notes
                Interface                

  Auto Number   Airtable auto-increments Order Id, OT Auto-number, Id
                on record creation       Autonumber

  Created Time  Airtable auto-captures   Created On, Created By
  / Created By  on creation              

  Last Modified Airtable auto-captures   Last Modified On
  Time          on any edit              

  Link (Record  Manual selection linking Select Customer, Agent, Select
  Link)         to another table\'s      Product
                record                   

  Lookup        Auto-populated from a    Name, Phone Number, Price (from
                linked record\'s field   Products)

  Rollup        Auto-aggregates values   Total Paid, Products Sub Total
                from linked records      
                (SUM, COUNT)             

  Formula       Auto-calculated from     Total, Balance Pending, MRP w/o
                other fields in same     Tax
                record                   

  Copied /      Manually or              Appointment ID (S), Booked By (S)
  Snapshot (S)  automation-copied before 
                appointment deletion     

  Automation    Set by Make, N8N, or     N8N Check, Billing Automation
                Airtable automations     
  ------------- ------------------------ ---------------------------------

**1.3 Core Data Flow**

Lead → Contacts → Appointments → OTP (one-time) OR Packages
(multi-session) → Installments (per-visit payments)

Lead → Contacts → Orders (online product sales) → Treatment Plan (online
packages)

Team links to all transaction tables for performance tracking. Products
provides the master catalog for pricing, tax, and HSN codes across all
transaction tables.

**1.4 Lookup Cascade Patterns**

Several fields involve multi-level lookups that cascade through linked
records:

**3-Level:** Orders → Select Customer → Contacts → Name/Phone/Address

**3-Level:** Orders → Agent → Team → Reporting To / Department

**3-Level:** Installments → Select Package → Packages → Booked By / New
or Cross-Sell / Customer Type

**4-Level:** Installments → Select Package → Packages → Treatment Name →
Products → Tax rate

**1.5 Archive Bases --- Record Preservation Strategy**

To manage Airtable\'s 1.25 lakh (125,000) record limit per base, Gleuhr
uses a set of dedicated archive bases that act as a permanent, read-only
ledger. The core transaction tables in each archive base are one-way
synced from the corresponding working base --- so when a record is
deleted from the working base, it is preserved in the archive base
indefinitely.

Each archive base also contains Contacts, Team, and Clinic tables in
two-way sync, ensuring that archived records retain full context and
lookups remain functional.

  ------------------ ------------------ ------------ ----------------------
  **Archive Base**   **Core Table(s)    **Access**   **Supporting Tables**
                     (One-Way Sync)**                

  Appointment Only   Appointments       Read-only    Contacts, Team, Clinic
                     (one-way sync from              (two-way sync)
                     Gleuhr Base)                    

  Orders Only        Orders (one-way    Read-only    Contacts, Team, Clinic
                     sync from Gleuhr                (two-way sync)
                     Base)                           

  OTP Only           OTP (one-way sync  Read-only    Contacts, Team, Clinic
                     from Clinic Base)               (two-way sync)

  Packages &         Packages +         Read-only    Contacts, Team, Clinic
  Installments Only  Installments                    (two-way sync)
                     (one-way sync from              
                     Clinic Base)                    
  ------------------ ------------------ ------------ ----------------------

**How It Works**

1\. A record is created and actively worked on in the working base
(Gleuhr or Clinic Base). The one-way sync automatically copies it to the
corresponding archive base in real time.

2\. When the record\'s lifecycle is complete (e.g., appointment visit
done, order dispatched and settled), it becomes eligible for deletion
from the working base.

3\. Before deletion, (S) snapshot fields are copied from the appointment
to any linked transaction records (OTP, Packages, Installments) so that
key context is embedded directly in the transaction record for reporting
convenience (see Section 12).

4\. The record is manually deleted from the working base. It remains
permanently preserved in the archive base.

5\. Team members can access archived records via read-only Interface
pages built on the archive bases. This is view-only --- no edits are
made to archived data.

**Complete Base Inventory**

  ------------------- ----------- ---------------------- --------------------
  **Base Name**       **Type**    **Primary Purpose**    **Sync / Access**

  Gleuhr Base         Working     Customer lifecycle,    MCP-connected
  (Account 1)                     online sales, team,    
                                  support                

  Clinic Base         Working     OTP, Packages,         Separate Airtable
  (Account 2)                     Installments           account

  Appointment Only    Archive     Completed appointments One-way sync from
                                                         Gleuhr Base

  Orders Only         Archive     Completed/dispatched   One-way sync from
                                  orders                 Gleuhr Base

  OTP Only            Archive     Completed one-time     One-way sync from
                                  purchases              Clinic Base

  Packages &          Archive     Completed packages and One-way sync from
  Installments Only               all installments       Clinic Base
  ------------------- ----------- ---------------------- --------------------

**Why Both Archive Bases and (S) Snapshot Fields Exist**

The archive bases provide complete record preservation --- every field,
every attachment, every linked record context is retained. The (S)
snapshot fields serve a different purpose: they embed the most critical
appointment data directly into the transaction record (OTP, Package,
Installment) so that day-to-day reporting and calculations can be done
from a single table without needing to cross-reference the archive base.
Both mechanisms work together --- the archive base is the comprehensive
backup, while (S) fields are the operational shortcut.

**Deletion Process (Currently Manual)**

Record deletion from working bases is currently a manual process. The
operations team identifies completed records, verifies that (S) fields
have been copied to linked transaction records, and then deletes the
record from the working base. Automation of this process is planned. The
deletion cadence varies by table --- appointments are deleted shortly
after visit completion, while orders and OTP records may be retained
longer in the working base before cleanup.

**2. Team Table --- Field Analysis**

**Base:** Gleuhr Base (Account 1)

**Total Fields:** \~89 fields (many are period-specific rollups)

**Purpose:** Central staff directory; anchor for all performance
tracking and revenue attribution

**Key Relationships:** Linked from Lead, Orders, Appointments, Customer
Tickets, Treatment Plans, Packages, OTP, Installments

Note: The Team table contains many rollup fields that are
period-specific variants (Daily, Weekly, Monthly, Contest) for both New
and Ongoing patient categories. These are structurally identical ---
only the date filter and patient type filter differ. The table below
groups them for clarity.

  ------------------------------ -------------- ------------ ---------------- ----------------
  **Field Name**                 **Type**       **Data       **Source         **Used By /
                                                Source**     Detail**         Notes**

  Agent Account                  Collaborator   Manual       Airtable user    Login-based
                                                             assigned to this views;
                                                             team member      record-level
                                                                              permissions

  Councilor Name                 Single Line    Manual       Staff display    Referenced
                                 Text                        name             across all
                                                                              transaction
                                                                              tables

  Reporting To                   Single Select  Manual       Manager          Revenue
                                                             assignment       attribution
                                                             (Vikram, Kiran,  chain;
                                                             Sarika, Ruby,    commission
                                                             Priya, Tejinder, tracking
                                                             Shalini,         
                                                             Saurabh, or      
                                                             clinic names)    

  Department                     Multi-Select   Manual       Role tags: Sales Interface
                                                             Team,            visibility;
                                                             Appointment      role-based
                                                             Team, Clinic     access
                                                             Councilor, BM,   
                                                             Reception,       
                                                             Doctor,          
                                                             Operations,      
                                                             Dietitian        

  Clinic                         Single Select  Manual       Home clinic      Clinic-level
                                                             location         reporting;
                                                                              interface
                                                                              filtering

  Phone Number                   Phone          Manual       Agent contact    Looked up by
                                                             number           Orders table

  Daily/Weekly/Monthly/Contest   Number         Manual       Target set by    Compared against
  Goal                                                       management       Sale rollups in
                                                                              Power BI

  Daily/Weekly/Monthly/Contest   Rollup         Auto         SUM of Total     Real-time sales
  Sale                                          (Rollup)     from linked      tracking; Power
                                                             Orders, filtered BI dashboards
                                                             by date range    

  Package Amount (New)           Rollup         Auto         SUM from linked  Revenue
                                                (Rollup)     Packages for New segmentation by
                                                             patients         patient type

  Package Amount (Ongoing)       Rollup         Auto         SUM from linked  New vs. ongoing
                                                (Rollup)     Packages for     revenue split
                                                             Revisit patients 

  Installment Amount (various    Rollup         Auto         SUM from linked  Installment
  periods)                                      (Rollup)     Installments,    collection
                                                             filtered by date tracking

  OTP Amount (various periods)   Rollup         Auto         SUM from linked  One-time
                                                (Rollup)     OTP records,     purchase
                                                             filtered by date tracking

  Lead                           Link (Multi)   Auto         Reverse link     Shows all leads
                                                (Linked)     from Lead        assigned to this
                                                             table\'s Owner   agent
                                                             field            

  Orders                         Link (Multi)   Auto         Reverse link     Shows all orders
                                                (Linked)     from Orders      attributed to
                                                             table\'s Agent   this agent
                                                             field            

  Appointments                   Link (Multi)   Auto         Reverse link     Shows all
                                                (Linked)     from             appointments
                                                             Appointments     linked to this
                                                             table            agent

  Customer Tickets               Link (Multi)   Auto         Reverse link     Support ticket
                                                (Linked)     from Customer    tracking per
                                                             Tickets          agent

  Treatment Plan                 Link (Multi)   Auto         Reverse link     Online package
                                                (Linked)     from Treatment   tracking per
                                                             Plan             agent

  Record ID                      Formula        Auto         RECORD_ID()      Cross-base
                                                (Formula)                     referencing
  ------------------------------ -------------- ------------ ---------------- ----------------

**Broken Rollup Links (Observed)**

Several rollup fields referencing Clinic Base tables (OTP Amount,
Package Amount, Installment Amount variants) show isValid: false in the
schema. This likely occurred when tables were moved to the separate
Clinic Base account, breaking the direct linked-record relationships
that these rollups depend on. These fields may need to be reconfigured
or replaced with alternative data aggregation methods (e.g., Power BI).

**3. New Appointments Table --- Field Analysis**

**Base:** Gleuhr Base (Account 1), synced to Clinic Base

**Total Fields:** \~154 fields (most complex table)

**Purpose:** Clinic visit management from booking through consultation,
prescription, and post-visit feedback

**Sync:** Natively synced to Clinic Base via Airtable sync

**Key Relationships:** Links to Contacts, Team (Doctor, Counselor,
Booked By), OTP, Packages

Note: Doctor Prescription fields (Treatment Recommended, Sittings per
service, Sitting Dates) repeat up to 10 times for multi-treatment
prescriptions. Feedback fields cover 7 quality dimensions. The table
below groups repetitive fields.

  ---------------------- ---------------- ------------- --------------------------- -------------------------
  **Field Name**         **Type**         **Data        **Source Detail**           **Used By / Notes**
                                          Source**                                  

  Appointment ID         Formula          Auto          PhoneNumber - (AutoNumber), Universal cross-base
                                          (Formula)     e.g. 9711280397 - (16332)   identifier; primary
                                                                                    bridge between bases

  Auto Number            Auto Number      Auto          Sequential counter          Part of Appointment ID
                                                                                    formula

  Customer               Link (Single)    Manual        Link to Contacts table      Master patient record
                                                        (prefersSingleRecordLink)   connection

  Appointment Date       Date             Manual        Scheduled visit date        Scheduling; date-based
                                                                                    filtering

  Clinic                 Single Select    Manual        Delhi, Chandigarh,          Location-based filtering;
                                                        Ludhiana, Bathinda,         synced to Clinic Base
                                                        Amritsar, Jalandhar, Karnal 

  Customer Type          Single Select    Manual        New Patient / Revisit /     Revenue categorization;
                                                        Walk In / New Repeat        drives New or Cross-Sell
                                                                                    logic

  Walk-In                Checkbox         Manual        Marks unscheduled visits    Walk-in tracking and
                                                                                    reporting

  Budget                 Single Select    Manual        Patient\'s stated budget    Counselor guidance for
                                                        range                       treatment recommendation

  Booking Advance        Number           Manual        Advance payment collected   Financial tracking;
                                                        at booking                  copied to (S) fields
                                                                                    before deletion

  Consultation Amount    Number           Manual        Consultation fee charged    Revenue tracking;
                                                                                    separate from treatment
                                                                                    revenue

  Clinic Status          Single Select    Manual/Auto   Booked → Payment Received → Appointment lifecycle
                                                        Visit Done → No Show →      tracking
                                                        Cancelled                   

  Patient Opted For      Single Select    Manual        Package / Single Session /  Consultation outcome;
                                                        Products / Consultation /   drives OTP vs Package
                                                        Token / On-going / Diet     creation

  Non-Conversion Reason  Single Select    Manual        Reason if patient didn\'t   Conversion analysis;
                                                        convert                     coaching data

  Doctor                 Link (Single)    Manual        Link to Team table for      Doctor assignment and
                                                        doctor                      performance

  Clinic Councilor       Link (Single)    Manual        Link to Team table for      Counselor who handled
                                                        counselor                   consultation

  Booked By              Link/Lookup      Manual/Auto   Appointment team member who Revenue attribution;
                                                        booked                      carried to
                                                                                    OTP/Package/Installment

  Reporting To           Lookup           Auto (Lookup) From Booked By → Team →     Manager attribution chain
                                                        Reporting To                

  Treatment Recommended  Multi-Select ×   Manual        Doctor fills up to 10       Clinical prescription;
  (1-10)                 10                             treatment lines             copied to Contacts

  Sittings per service   Number × 10      Manual        Sessions prescribed per     Treatment planning
  (1-10)                                                treatment line              

  Products/Supplements   Text             Manual        Doctor\'s product           Product cross-sell;
  Recommended                                           recommendations             counselor reference

  Feedback fields (7     Rating/Select    Manual        Councilor, Doctor,          Quality tracking;
  dimensions)                                           Treatment, Clinic Hygiene,  Customer Tickets input
                                                        Reception, Therapist, Wait  
                                                        Time                        

  Before & After Images  Attachment       Manual        Clinical photos per sitting Treatment documentation;
                                                                                    patient results

  Visit No               Number/Formula   Auto          Sequential visit count for  Copied to (S) fields;
                                                        this patient                revisit tracking

  Name (from Customer)   Lookup           Auto (Lookup) Contacts → First Name +     Display convenience
                                                        Last Name                   

  Phone (from Customer)  Lookup           Auto (Lookup) Contacts → Phone Number     Contact reference

  OTP                    Link (Multi)     Auto (Linked) Reverse link from OTP table Links appointment to
                                                        in Clinic Base              one-time purchases

  Packages               Link (Multi)     Auto (Linked) Reverse link from Packages  Links appointment to
                                                        table in Clinic Base        multi-session packages

  Record ID              Formula          Auto          RECORD_ID()                 Cross-table referencing
                                          (Formula)                                 
  ---------------------- ---------------- ------------- --------------------------- -------------------------

**Record Deletion Protocol**

Old appointment records are periodically deleted to manage Airtable
record limits. Before deletion, the following fields are copied to
linked OTP, Package, or Installment records as \'(S)\' snapshot fields:
Appointment ID, Visit No, Name, Clinic, Booking Advance/Advance Amount,
Patient Opted For, Booked By, Reporting To, Consultation Amount. This
preserves essential appointment context permanently in the transaction
records.

**4. Orders Table --- Field Analysis**

**Base:** Gleuhr Base (Account 1)

**Total Fields:** \~120+ fields

**Purpose:** Product sales and fulfillment --- online (D2C) and
in-clinic sales

**Key Relationships:** Links to Contacts, Team, Products, Lead,
Treatment Plan

The Orders table has a dual-track status pipeline: Agent Status (payment
collection) and Operations Status (verification through dispatch). It
also includes an order duplication system for complaint resolution,
where a replacement order links back to the original.

  ---------------- --------------- ------------ --------------------------- --------------------
  **Field Name**   **Type**        **Data       **Source Detail**           **Used By / Notes**
                                   Source**                                 

  Order Id         Auto Number     Auto         Sequential order ID         Primary identifier
                                                                            for all orders

  Select Customer  Link (Single)   Manual       Link to Contacts            Patient record
                                                (prefersSingleRecordLink)   connection

  Agent            Link (Single)   Manual       Link to Team table          Sales agent
                                                                            attribution

  Select Products  Link (Multi)    Manual       Link to Products table      Products included in
                                                                            order

  Name             Lookup          Auto         Select Customer → Contacts  Display field
                                   (Lookup)     → First Name                

  Phone Number     Lookup          Auto         Select Customer → Contacts  Contact reference;
                                   (Lookup)     → Phone Number              dispatch
                                                                            coordination

  Address / Pin    Lookups         Auto         Select Customer → Contacts  Shipping details
  Code / Country                   (Lookup)     → Address fields            

  Agent Account    Lookup          Auto         Agent → Team → Agent        Interface filtering
                                   (Lookup)     Account (Collaborator)      for agent-specific
                                                                            views

  Reporting To     Lookup          Auto         Agent → Team → Reporting To Manager attribution
  (from Agent)                     (Lookup)                                 

  Agent -          Lookup          Auto         Agent → Team → Department   Role-based filtering
  Department                       (Lookup)                                 

  Price (from      Lookup          Auto         Select Products → Products  Individual product
  Select Products)                 (Lookup)     → Price                     prices

  Tax (from Select Lookup          Auto         Select Products → Products  Product tax rates
  Products)                        (Lookup)     → Tax                       

  HSN Product Wise Lookup          Auto         Select Products → Products  GST classification
                                   (Lookup)     → HSN Product Wise          codes

  MRP w/o Tax      Lookup          Auto         Select Products → Products  Pre-tax pricing
                                   (Lookup)     → MRP w/o Tax               

  Products Sub     Rollup          Auto         SUM of Price from Select    Base amount before
  Total                            (Rollup)     Products                    discounts

  Discount %       Number          Manual       Discount percentage applied Part of Total
                                                                            calculation

  Additional       Number          Manual       Fixed amount discount       Part of Total
  Discount                                                                  calculation

  Shipping Charges Number          Manual       Delivery charges            Part of Total
                                                                            calculation

  Previous Balance Number          Manual       Outstanding balance from    Part of Total
                                                prior orders                calculation

  Total            Formula         Auto         Products Sub Total -        Final order amount;
                                   (Formula)    (Discount%) - Additional    feeds Team rollups
                                                Discount + Shipping -       
                                                Previous Balance            

  COD Advance      Number          Manual       Advance for COD orders      Partial payment
                                                                            tracking

  COD Balance      Formula         Auto         IF(Payment                  Remaining COD amount
                                   (Formula)    Mode=\'Pre-Paid\', 0,       
                                                Total - COD Advance)        

  Payment Mode     Single Select   Manual       Pre-Paid or COD             Payment
                                                                            classification

  Payment Mode     Single Select   Manual       Cash, UPI, Card, Bank       Clinic pickup
  (Reception)                                   Transfer                    payment method

  Payment Proof    Attachment      Manual       Screenshot or receipt       Verification by
                                                                            operations

  Payment Verified Checkbox        Manual       Operations confirms payment Verification gate

  Order Status     Single Select   Manual       Payment Pending → On Hold → Agent-side pipeline
  (Agent)                                       Send For Verification →     
                                                Incorrect Details           

  Order Status     Single Select   Manual       Pending Payment             Ops-side pipeline
  (Operations)                                  Verification → Ready For    
                                                Invoice → Ready For         
                                                Dispatch → Order Dispatched 
                                                (9 statuses)                

  Order Type       Single Select   Manual       New Customer Order / Repeat Customer acquisition
                                                Order                       vs retention

  Invoice Created  Checkbox        Manual       Accounts team ticks after   Invoice tracking
                                                invoice generation          

  Invoice Number / Text /          Manual       Invoice reference and file  Accounting records
  Attachment       Attachment                                               

  Ledger Updated   Checkbox        Manual       Accounts confirms ledger    Accounting
                                                entry                       completion

  Dispatch Mode    Single Select   Manual       Courier or Clinic Pickup (8 Fulfillment routing
                                                clinic options)             

  Tracking Id      Text            Manual       Courier tracking number     Shipment tracking

  Delivery         Single Select   Manual       Domestic, International,    Shipping
  Location                                      Local, Delhi Courier        classification

  Dispatched       Single Select   Manual       Wrong/Damaged/Missing       Issue categorization
  Issues                                        Product, Order Not Received 

  Resolution       Single Select   Manual       Adjust In Next Order,       Resolution tracking
  Provided                                      Product Dispatched          

  Lead             Link (Multi)    Auto         Reverse link from Lead      Lead-to-order
                                   (Linked)     table                       attribution

  Treatment Plan   Link (Multi)    Manual       Link to Treatment Plan      Online package
  (Package)                                     table                       connection

  Dietician fields Lookup/Select   Mixed        Dietician from Contacts;    Post-sale diet
                                                Call Status, Diet Plan      upsell workflow
                                                Pitched manual              

  Create Copy      Checkbox        Manual       Triggers automation to      Complaint
  (Trigger)                                     duplicate order             resolution;
                                                                            replacement orders

  Original Order / Link / Formula  Auto         Self-link for duplicated    Order duplication
  Is Copy                                       orders; formula shows copy  tracking
                                                status                      

  Created from     Checkbox        Manual       Marks orders created at     Channel attribution
  Clinic                                        clinic reception            

  Record ID /      Formula         Auto         RECORD_ID() and URL builder Cross-referencing;
  Record URL                       (Formula)                                direct access links

  Created On       Created Time    Auto         Record creation timestamp   Audit trail

  Created By       Created By      Auto         Airtable user who created   Audit trail
                                                record                      

  Last Modified On Last Modified   Auto         Last update timestamp       Change tracking
                   Time                                                     
  ---------------- --------------- ------------ --------------------------- --------------------

**Total Formula Breakdown**

Total = Products Sub Total × (1 - Discount%) - Additional Discount +
Shipping Charges - Previous Balance

This formula combines: the rollup sum of product prices, percentage and
fixed discounts, shipping, and any outstanding balance. The resulting
Total field feeds into the Team table\'s sales rollups for performance
tracking.

**Order Duplication System**

When a dispatched order has issues (wrong/damaged/missing product), a
replacement order is created via the Create Copy (Trigger) checkbox. The
duplicated order links back to the Original Order via a self-referencing
link field. Formula fields (Is Copy, Has Copy) track the relationship.
Guard Status prevents invalid duplicates.

**5. Products Table --- Field Analysis**

**Base:** Gleuhr Base (Account 1); similar table exists in Clinic Base

**Total Fields:** 23 fields

**Purpose:** Master product catalog --- skincare products, treatment
services, and diet plans

**Used By:** Orders, Treatment Plan, OTP, Packages, Installments,
Website Orders, Diet Plan

  ---------------- ---------- ------------ ---------------------- ----------------
  **Field Name**   **Type**   **Data       **Source Detail**      **Used By /
                              Source**                            Notes**

  Product Name     Single     Manual       Product/service/diet   Referenced by
                   Line Text               name                   Orders,
                                                                  Treatment Plan,
                                                                  OTP, Packages,
                                                                  Website Orders,
                                                                  Diet Plan

  Price            Number     Manual       MRP including tax      Used in Total
                                                                  calculations
                                                                  across all
                                                                  transaction
                                                                  tables

  Product Status   Checkbox   Manual       Active/inactive toggle Controls
                                                                  visibility in
                                                                  product
                                                                  selection
                                                                  dropdowns

  Product Category Single     Manual       Product, Treatment     Categorization
                   Select                  Plan, or Diet          for filtering
                                                                  and reporting

  HSN Product Wise Single     Manual       HSN code for GST       Looked up by
                   Line Text               classification         Orders, OTP,
                                                                  Installments for
                                                                  invoicing

  Tax              Percent    Manual       GST tax rate           Looked up for
                                                                  tax calculations

  MRP w/o Tax      Formula    Auto         Price - (Price × Tax)  Pre-tax price
                              (Formula)                           for invoicing

  Orders           Link       Auto         Reverse link from      Shows all orders
                   (Multi)    (Linked)     Orders → Select        containing this
                                           Products               product

  Treatment Plan   Link       Auto         Reverse link from      Treatment plan
  (Package) 2      (Multi)    (Linked)     Treatment Plan         usage

  Website Orders   Link       Auto         Reverse link from      E-commerce usage
                   (Multi)    (Linked)     Website Orders         

  Count            Rollup     Auto         COUNT of linked Orders Product
                              (Rollup)                            popularity
                                                                  tracking

  TP Count         Rollup     Auto         COUNT of linked        Treatment plan
                              (Rollup)     Treatment Plans        usage frequency

  Record ID        Formula    Auto         RECORD_ID()            Cross-table
                              (Formula)                           referencing
  ---------------- ---------- ------------ ---------------------- ----------------

**Tax Calculation Pattern**

Price (MRP including tax) is the base field. MRP w/o Tax is
reverse-calculated as Price - (Price × Tax). This pattern is critical
for GST invoicing: invoices must show pre-tax amounts, tax rates, and
tax amounts separately. Typical rates: 5% for supplements (HSN
21069099), 18% for cosmetics/serums (HSN 33049990), 5% for services (HSN
999722), 5% for diet (HSN 999319).

**6. OTP Table --- Field Analysis (Clinic Base)**

**Base:** Clinic Base (Account 2)

**Total Fields:** \~89 fields

**Purpose:** One-time purchases at clinic --- products, services, or
diet sold as single payment during a visit

**Key Relationships:** Links to synced Appointments, synced Team,
Products (Clinic Base)

The OTP table tracks four product categories independently: Products,
Services, Diet, and Complimentary items. Each category has its own
price, discount, subtotal, HSN code, tax rate, and pre-tax price fields
--- enabling accurate per-category GST invoicing.

  ----------------- ---------------- --------------- ------------------- ----------------------
  **Field Name**    **Type**         **Data Source** **Source Detail**   **Used By / Notes**

  Order Id          Formula/Text     Auto            OT - {OT            Primary identifier for
                                                     Auto-number}, e.g.  one-time purchases
                                                     OT - 16543          

  OT Auto-number    Auto Number      Auto            Sequential counter  Part of Order Id
                                                                         formula

  Phone No          Lookup           Auto (Lookup)   From linked         Patient identification
  (Appointment)                                      Appointment record  

  Phone Number      Number           Manual/Lookup   Customer phone      Patient
                                                     number              identification;
                                                                         deduplication

  Name              Lookup           Auto (Lookup)   From linked         Display field
  (appointment)                                      Appointment →       
                                                     Customer name       

  Name              Text             Manual          Customer name       Backup name field
                                                     (manual entry)      

  Order Date        Date             Manual          Date of purchase    Transaction dating

  Appointment       Link             Manual          Link to synced      Transaction-to-visit
                                                     Appointments table  link; source of
                                                                         lookups

  Clinic            Single Select    Manual          Clinic where        Location-based
                                                     purchase occurred   reporting

  Select Councilor  Link             Manual          Link to synced Team Counselor who made the
                                                     table               sale

  Team              Lookup/Text      Auto/Manual     Team member name    Display field for
                                                     from Select         reporting
                                                     Councilor           

  Councilor Account Lookup           Auto (Lookup)   Select Councilor →  Interface filtering
                                                     Team → Agent        
                                                     Account             

  Booked By         Text/Lookup      Manual          Who booked the      Revenue attribution to
                                                     original            appointment booker
                                                     appointment         
                                                     (consistent across  
                                                     all tables)         

  Reporting to      Text/Lookup      Manual          Manager of Booked   Commission and
                                                     By agent            management attribution

  Customer Type     Single Select    Manual          New Patient /       Revenue segmentation
                                                     Revisit / Walk-In   

  New or Cross-Sell Single Select    Manual          New (first          Acquisition vs
                                                     purchase) /         monetization tracking
                                                     Cross-Sell          
                                                     (additional)        

  Select Product    Link (Multi)     Manual          Link to Products    Products sold in this
                                                     table in Clinic     transaction
                                                     Base                

  Product Discount  Number/Text      Manual          Discount on         Pricing adjustment
                                                     products            

  Product Dis%      Number/Text      Manual          Discount percentage Percentage-based
                                                     for products        discount

  Price (Product)   Lookup           Auto (Lookup)   Select Product →    Product MRP
                                                     Products → Price    

  Sub Total         Number/Formula   Auto/Manual     Product price after Product-level subtotal
  (Product)                                          discount            

  Product w/o MRP   Lookup/Formula   Auto            Pre-tax product     Invoice line item
                                                     price               

  Product HSN       Lookup           Auto (Lookup)   Select Product →    GST classification
                                                     Products → HSN      

  Product Tax       Lookup/Formula   Auto            Tax amount on       Tax compliance
                                                     products            

  Select Services   Link (Multi)     Manual          Link to             Services rendered
                                                     Products/Services   
                                                     table               

  Services Discount Number/Text      Manual          Service discount    Service pricing
  / Dis %                                            amount and          adjustment
                                                     percentage          

  Price (Services)  Lookup / Formula Auto            Service pricing     Service-level subtotal
  / Sub Total                                        from Products table 
  (Services)                                                             

  Service w/o MRP / Lookup/Formula   Auto            Pre-tax price, HSN  Service tax compliance
  HSN / Tax                                          code, tax for       
                                                     services            

  Select Diet       Link (Multi)     Manual          Link to Diet        Diet plans sold
                                                     products            

  Diet Discount /   Various          Auto/Manual     Diet pricing,       Diet tax compliance
  Dis % / Sub Total                                  discounts, tax      
  / HSN / Tax                                        details             

  Complimentary     Link (Multi)     Manual          Free products given Complimentary tracking
  products                                           with purchase       

  Complimentary     Count/Rollup     Auto            Number of           Complimentary volume
  Count                                              complimentary items tracking

  Price/Tax/HSN     Lookup           Auto (Lookup)   From Complimentary  Tax compliance for
  (Complimentary)                                    products link       free items

  Total             Number/Formula   Manual/Auto     Total transaction   Primary revenue field;
                                                     amount              feeds Team rollups

  Subtotal          Number/Formula   Auto            Pre-tax total       Invoicing

  Tax               Number/Formula   Auto            Total tax amount    GST compliance

  Total Receivable  Formula          Auto            Sum of all category Cross-validation with
                                                     subtotals           Total

  COD Amount        Number           Manual          Cash on delivery    Payment tracking
                                                     amount if           
                                                     applicable          

  Payment Mode      Single Select    Manual          UPI / Cash / Card / Payment method
                                                     Bank Transfer       

  Invoice created   Checkbox         Manual          Accounts team marks Invoice workflow
                                                     when invoice        
                                                     generated           

  Invoice Status    Single Select    Manual          Invoice Pending /   Invoice pipeline
                                                     Invoice Created     

  Payment Proof     Attachment       Manual          Receipt or payment  Verification
                                                     screenshot          

  Ledger Updated    Checkbox         Manual          Accounts confirms   Accounting completion
                                                     ledger entry        

  Appointment ID    Text             Copied          Snapshot from       Permanent reference to
  (S)                                                Appointment before  original appointment
                                                     deletion            

  Visit No (S)      Number           Copied          Snapshot from       Visit sequence
                                                     Appointment before  preservation
                                                     deletion            

  Name (S)          Text             Copied          Snapshot from       Patient name
                                                     Appointment before  preservation
                                                     deletion            

  Clinic (S)        Text             Copied          Snapshot from       Clinic preservation
                                                     Appointment before  
                                                     deletion            

  Booking Advance   Number           Copied          Snapshot from       Advance payment
  (S)                                                Appointment before  preservation
                                                     deletion            

  Patient Opted for Text             Copied          Snapshot from       Consultation outcome
  (S)                                                Appointment before  preservation
                                                     deletion            

  Booked By (S)     Text             Copied          Snapshot from       Attribution
                                                     Appointment before  preservation
                                                     deletion            

  Reporting to (S)  Text             Copied          Snapshot from       Manager attribution
                                                     Appointment before  preservation
                                                     deletion            

  N8N Check         Checkbox/Text    Auto            Automation          Automation control
                                                     trigger/flag for    
                                                     N8N workflows       

  Billing           Number/Formula   Auto            Automation helper   N8N integration
  Automation                                         field               

  Notes             Long Text        Manual          Free-text notes     Additional context

  Created On        Created Time     Auto            Record creation     Audit trail
                                                     timestamp           

  Created By        Created By       Auto            User who created    Audit trail
                                                     record              

  Last Modified On  Last Modified    Auto            Last update         Change tracking
                    Time                             timestamp           

  Record ID         Formula          Auto (Formula)  RECORD_ID()         Cross-referencing

  Category (from    Lookup           Auto (Lookup)   Service category    Service categorization
  Select Services)                                   from Products table 

  Packages          Link             Manual/Auto     Link to Packages if Package association
                                                     related             
  ----------------- ---------------- --------------- ------------------- ----------------------

**7. Packages Table --- Field Analysis (Clinic Base)**

**Base:** Clinic Base (Account 2)

**Total Fields:** \~67 fields

**Purpose:** Multi-session treatment packages --- the primary high-value
clinic offering

**Key Relationships:** Links to synced Appointments, synced Team,
Products (Clinic Base), Installments

When a patient commits to a multi-session treatment (e.g., Pigmentation
Package --- 12 sessions), a Package record captures the treatment type,
total price, and counselor. Payments across visits are recorded as
Installments linked to this Package. The Total Paid rollup and Balance
Pending formula provide real-time payment progress.

  ---------------- ---------------- --------------- ------------------------- -------------------
  **Field Name**   **Type**         **Data Source** **Source Detail**         **Used By / Notes**

  Treatment Id     Formula          Auto (Formula)  PhoneNumber-AutoNumber,   Primary identifier;
                                                    e.g. 9711280397-4766      matches appointment
                                                                              ID format

  Id Autonumber    Auto Number      Auto            Sequential counter        Part of Treatment
                                                                              Id formula

  Select           Link             Manual          Link to synced            Appointment during
  Appointment                                       Appointments table        which package was
                                                                              sold

  Name (new)       Lookup/Formula   Auto            Patient name from         Display field
                                                    Appointment or Contact    

  Phone Number     Lookup           Auto (Lookup)   From Select Appointment → Patient
  (from apt)                                        Customer → Phone          identification

  Contact          Number/Link      Manual/Auto     Customer record reference Patient master
                                                                              record link

  Customer Number  Number           Manual/Lookup   Patient phone number      Direct contact
                                                                              reference

  Treatment Name   Link             Manual          Link to Products table    Standardized
                                                    (treatment packages)      package name
                                                                              (Pigmentation
                                                                              Package, LHR Full
                                                                              Body, etc.)

  Select Service   Link/Text        Manual          Services included in this Service component
                                                    package                   of package

  Diet             Link/Number      Manual          Diet plan included in     Diet component
                                                    package                   

  Select Councilor Link             Manual          Link to synced Team table Counselor who sold
                                                                              the package

  Councilor        Lookup           Auto (Lookup)   Select Councilor → Team → Interface filtering
  Account                                           Agent Account             

  Booked By        Text             Manual/Copied   Who booked the original   Revenue
                                                    appointment               attribution;
                                                                              inherited by
                                                                              Installments

  Reporting To     Text             Manual/Copied   Manager of Booked By      Commission
                                                    agent                     attribution;
                                                                              inherited by
                                                                              Installments

  Team             Text/Lookup      Auto/Manual     Team member from Select   Reporting
                                                    Councilor                 

  Customer Type    Single Select    Manual          New Patient / Revisit     Revenue
                                                                              segmentation

  New or           Single Select    Manual          First package (New) /     Acquisition vs
  Cross-Sell                                        Additional (Cross-Sell)   monetization;
                                                                              inherited by
                                                                              Installments

  Total Amount     Number           Manual          Full package price        Revenue tracking;
                                                                              Balance Pending
                                                                              calculation

  Total Paid       Rollup           Auto (Rollup)   SUM of Total from linked  Payment progress
                                                    Installments              tracking

  Balance Pending  Formula          Auto (Formula)  Total Amount - Total Paid Outstanding amount;
                                                                              triggers Package
                                                                              Done

  Installment Paid Link (Multi)     Auto (Linked)   Reverse link from         All payment records
                                                    Installments table        for this package

  IP-Count         Count/Formula    Auto            Count of linked           Automation logic;
  (Automation)                                      Installments              session counting

  Package Status   Single Select    Manual/Auto     Balance Pending / Package Lifecycle status
                                                    Done                      

  Treatment Status Number/Select    Manual          Treatment progress        Clinical progress
                                                    indicator                 

  Treatment        Date             Manual          When first session        Timeline tracking
  Started On                                        occurred                  

  Clinic           Single Select    Manual          Clinic location           Location-based
                                                                              reporting

  Created On       Created Time     Auto            Record creation timestamp Audit trail

  Created By       Created By       Auto            User who created record   Audit trail

  MRP without Tax  Lookup           Auto (Lookup)   Treatment Name → Products Pre-tax package
  (from Treatment                                   → MRP w/o Tax             price
  Name)                                                                       

  Tax (from        Lookup           Auto (Lookup)   Treatment Name → Products Package tax rate
  Treatment Name)                                   → Tax rate                

  Tax (services)   Lookup/Text      Auto            Service tax rate from     GST compliance
                                                    Products                  

  HSN Treatment    Lookup           Auto (Lookup)   Treatment Name → Products GST classification
                                                    → HSN code                

  HSN Product wise Lookup           Auto (Lookup)   Select Service → Products Service GST codes
  (from Select                                      → HSN                     
  Service)                                                                    

  Appointment ID   Text             Copied          Snapshot from Appointment Permanent
  (S)                                               before deletion           appointment
                                                                              reference

  Visit No. (S)    Number           Copied          Snapshot from Appointment Visit sequence
                                                    before deletion           

  Name (S)         Text             Copied          Snapshot from Appointment Patient name
                                                    before deletion           

  Clinic (S)       Text             Copied          Snapshot from Appointment Clinic location
                                                    before deletion           

  Advance Amount   Number           Copied          Snapshot from Appointment Advance payment
  (S)                                               before deletion           

  Patient Opted    Text             Copied          Snapshot from Appointment Consultation
  For (S)                                           before deletion           outcome

  Booked By (S)    Text             Copied          Snapshot from Appointment Attribution
                                                    before deletion           

  Reporting To (S) Text             Copied          Snapshot from Appointment Manager attribution
                                                    before deletion           

  Consultation     Number           Copied          Snapshot from Appointment Consultation fee
  Amount (S)                                        before deletion           

  Balace Zero      Formula/Text     Auto            Flags when Balance        Triggers Package
  (Automation)                                      Pending = 0               Done automation

  Package Edits    Text             Manual          Notes on package          Change log
                                                    modifications             

  N8N-Automation   Text/Checkbox    Auto            N8N automation trigger    Automation control
                                                    field                     

  Appt-Count       Count/Rollup     Auto            Count of linked           Multi-visit
                                                    appointments              tracking

  Notes            Long Text        Manual          Free-text notes           Additional context

  Last Modified On Last Modified    Auto            Last update timestamp     Change tracking
                   Time                                                       

  Record ID /      Formula          Auto (Formula)  RECORD_ID() variants      Cross-referencing
  Record ID-TID                                                               

  Category (from   Lookup           Auto (Lookup)   Service category from     Service
  Select Service)                                   Products table            categorization
  ---------------- ---------------- --------------- ------------------------- -------------------

**8. Installments Table --- Field Analysis (Clinic Base)**

**Base:** Clinic Base (Account 2)

**Total Fields:** \~130 fields

**Purpose:** Individual payment records against Packages --- one record
per visit/payment event

**Key Relationships:** Links to Packages (parent), synced Appointments,
Products (Clinic Base)

Each Installment captures: the payment amount, products/services given
during that visit, per-category pricing and tax details, and invoicing
status. Many fields are inherited from the parent Package via lookups,
ensuring consistent revenue attribution across all installment payments.

  ----------------- ------------------ ---------------- ---------------- ----------------------
  **Field Name**    **Type**           **Data Source**  **Source         **Used By / Notes**
                                                        Detail**         

  Balance Payment   Auto Number        Auto             Sequential       Primary identifier
  Id                                                    installment ID   

  Select Package    Link (Single)      Manual           Link to parent   Core relationship; all
                                                        Packages record  inherited fields flow
                                                                         from here

  Installment No    Number             Manual           Payment sequence Session/payment
                                                        (1, 2, 3\...)    ordering

  Visit Amount Paid Number             Manual           Amount paid this Payment amount; feeds
  / Total                                               visit            Package Total Paid
                                                                         rollup

  Date Of Visit     Date               Manual           Payment/visit    Transaction dating
                                                        date             

  Clinic            Single Select      Manual           Clinic where     Location reporting
                                                        payment occurred 

  Payment Mode      Single Select      Manual           UPI, Cash, Card, Payment method
                                                        Bank Transfer    

  Select Product    Link (Multi)       Manual           Products given   Per-visit product
                                                        this visit       tracking

  Select Service    Link/Number        Manual           Services         Per-visit service
                                                        rendered this    tracking
                                                        visit            

  Select Diet       Link/Number        Manual           Diet plans       Per-visit diet
                                                        included         tracking

  Product Discount  Number             Manual/Formula   Product pricing  Product-level
  / Sub Total                                           for this         financials
                                                        installment      

  Product Dis %     Number             Manual           Product discount Discount tracking
                                                        percentage       

  Service Discount  Number             Manual/Formula   Service pricing  Service-level
  / Sub Total                                           for this         financials
                                                        installment      

  Service Dis %     Number             Manual           Service discount Discount tracking
                                                        percentage       

  Diet Discount /   Number             Manual/Formula   Diet pricing for Diet-level financials
  Sub Total                                             this installment 

  Diet Dis %        Number             Manual           Diet discount    Discount tracking
                                                        percentage       

  Product - Price / Lookup/Formula     Auto             From Select      Product tax compliance
  MRP w/o TAX / HSN                                     Product →        
  / Tax %                                               Products table   

  Service - Price / Lookup/Formula     Auto             From Select      Service tax compliance
  MRP w/o TAX / HSN                                     Service →        
  / Tax %                                               Products table   

  Diet - Price /    Lookup/Formula     Auto             From Select Diet Diet tax compliance
  MRP w/o TAX / HSN                                     → Products table 
  / Tax %                                                                

  Total Receivable  Formula            Auto (Formula)   Sum of all       Cross-validation
                                                        category         
                                                        subtotals        

  Subtotal          Number/Formula     Auto             Pre-tax total    Invoicing

  Tax               Number/Formula     Auto             Total tax amount GST compliance

  COD Amount        Number             Manual           Cash on delivery Payment tracking
                                                        amount           

  Complimentary     Link               Manual           Free products    Complimentary tracking
  Products                                              given this visit 

  Complimentary -   Lookup             Auto (Lookup)    From             Complimentary tax
  Price / Tax % /                                       Complimentary    compliance
  HSN / MRP w/o TAX                                     Products link    

  Councilor         Text/Link          Manual           Counselor        Per-visit attribution
                                                        handling this    
                                                        visit            

  Councilor Account Lookup             Auto (Lookup)    Councilor → Team Interface filtering
                                                        → Agent Account  

  Team              Text/Lookup        Auto/Manual      Team member name Reporting

  Invoice created   Checkbox           Manual           Accounts marks   Invoice workflow
                                                        when invoice     
                                                        generated        

  Invoice Status    Single Select      Manual           Invoice Pending  Invoice pipeline
                                                        / Invoice        
                                                        Created          

  Payment Proof     Attachment         Manual           Receipt or       Verification
                                                        screenshot       

  Ledger Updated    Checkbox           Manual           Accounts         Accounting completion
                                                        confirms ledger  
                                                        entry            

  Booked By (from   Lookup             Auto (Lookup)    Select Package → Inherited attribution
  Packages)                                             Packages →       from package
                                                        Booked By        

  Reporting To      Lookup             Auto (Lookup)    Select Package → Inherited manager
  (from Packages)                                       Packages →       attribution
                                                        Reporting To     

  New or Cross-Sell Lookup             Auto (Lookup)    Select Package → Inherited revenue
  (from Packages)                                       Packages → New   segmentation
                                                        or Cross-Sell    

  Customer Type     Lookup             Auto (Lookup)    Select Package → Inherited patient type
  (from Packages)                                       Packages →       
                                                        Customer Type    

  Treatment Name    Lookup             Auto (Lookup)    Select Package → Package type reference
  (from Select                                          Packages →       
  Package)                                              Treatment Name   

  Tax (from         Lookup             Auto (Lookup)    Package →        Treatment tax rate
  Treatment Name)                                       Treatment Name → (cascaded lookup)
  (from Packages)                                       Products → Tax   

  Tax (services)    Lookup             Auto (Lookup)    Package → Select Service tax from
  (from Packages)                                       Service → Tax    package

  HSN Product wise  Lookup             Auto (Lookup)    Package → Select Service HSN from
  (Package)                                             Service → HSN    package

  Packages /        Lookup/Link        Auto             Various          Package context
  Treatment Name /                                      references back  
  Select Treatment                                      to parent        
                                                        package          

  Customer Name /   Lookup/Number      Auto/Manual      Customer         Patient reference
  Customer Phone                                        identification   
  number / Patient                                      from package or  
  Ph No.                                                direct entry     

  Appointment (New) Link/Text          Manual/Auto      Link to synced   Visit-to-installment
  / Appointment ID                                      Appointments     link
                                                        table            

  Appointment ID    Text               Copied           Snapshot from    Permanent appointment
  (S)                                                   Appointment      reference
                                                        before deletion  

  Visit No (S)      Number             Copied           Snapshot from    Visit sequence
                                                        Appointment      
                                                        before deletion  

  Name (S)          Text               Copied           Snapshot from    Patient name
                                                        Appointment      
                                                        before deletion  

  Clinic (S)        Text               Copied           Snapshot from    Clinic location
                                                        Appointment      
                                                        before deletion  

  Booking           Number             Copied           Snapshot from    Advance payment
  Advance/Advance                                       Appointment      
  Amount (S)                                            before deletion  

  Patient Opted for Text               Copied           Snapshot from    Consultation outcome
  (S)                                                   Appointment      
                                                        before deletion  

  Booked By (S)     Text               Copied           Snapshot from    Attribution
                                                        Appointment      
                                                        before deletion  

  Reporting to (S)  Text               Copied           Snapshot from    Manager attribution
                                                        Appointment      
                                                        before deletion  

  Consultation      Number             Copied           Snapshot from    Consultation fee
  Amount (S)                                            Appointment      
                                                        before deletion  

  N8N Check /       Text/Checkbox      Auto             Automation       N8N workflow control
  N8N-Automation                                        trigger fields   

  Notes             Long Text          Manual           Free-text notes  Additional context

  Created At        Created Time       Auto             Record creation  Audit trail
                                                        timestamp        

  Created By        Created By         Auto             User who created Audit trail
                                                        record           

  Last Modified On  Last Modified Time Auto             Last update      Change tracking
                                                        timestamp        

  Record ID         Formula            Auto (Formula)   RECORD_ID()      Cross-referencing

  Copy Done / Empty Checkbox/Formula   Auto             Automation       Data integrity checks
  Check                                                 helper fields    
  ----------------- ------------------ ---------------- ---------------- ----------------------

**9. Cross-Table Relationships & Lookup Chains**

**9.1 Primary Link Relationships**

  ------------------ --------------- ----------------- ---------------------------------
  **Relationship**   **Link Field**  **Cardinality**   **Fields Derived
                                                       (Lookups/Rollups)**

  Orders → Contacts  Select Customer Single            Name, Phone, Address, Pin Code,
                                                       Country, Secondary Phone,
                                                       Dietician

  Orders → Team      Agent           Single            Agent Account, Agent Phone,
                                                       Reporting To, Department

  Orders → Products  Select Products Multi             Price, Tax, HSN Product Wise, MRP
                                                       w/o Tax

  Orders → Lead      Lead            Multi             Status, Lead Concern

  Orders → Treatment Treatment Plan  Multi             Online package association
  Plan               (Package)                         

  Appointments →     Customer        Single            Name, Phone, all patient
  Contacts                                             demographics

  Appointments →     Doctor /        Single each       Agent Account, Reporting To
  Team               Counselor /                       
                     Booked By                         

  OTP → Appointments Appointment     Single            Phone No, Name; also (S) snapshot
  (synced)                                             fields

  OTP → Team         Select          Single            Councilor Account, Team name
  (synced)           Councilor                         

  OTP → Products     Select Product  Multi each        Price, HSN, Tax, MRP w/o Tax per
  (Clinic)           / Services /                      category
                     Diet                              

  Packages →         Select          Single            All (S) snapshot fields
  Appointments       Appointment                       
  (synced)                                             

  Packages → Team    Select          Single            Councilor Account
  (synced)           Councilor                         

  Packages →         Treatment Name  Single/Multi      MRP w/o Tax, Tax, HSN
  Products (Clinic)  / Select                          
                     Service                           

  Packages →         Installment     Multi (reverse)   Total Paid (rollup), IP-Count
  Installments       Paid                              

  Installments →     Select Package  Single            Booked By, Reporting To, New or
  Packages                                             Cross-Sell, Customer Type,
                                                       Treatment Name, Tax, HSN

  Installments →     Select Product  Multi each        Price, HSN, Tax, MRP w/o Tax per
  Products (Clinic)  / Service /                       category
                     Diet                              

  Installments →     Appointment     Single            All (S) snapshot fields
  Appointments       (New)                             
  (synced)                                             
  ------------------ --------------- ----------------- ---------------------------------

**10. Formula Dependencies Map**

**10.1 Key Formulas**

  -------------- ------------- --------------------------------- ----------------
  **Table**      **Field**     **Formula Logic**                 **Depends On**

  Orders         Total         Products Sub Total × (1 -         Products Sub
                               Discount%) - Additional           Total (rollup),
                               Discount + Shipping - Previous    Discount %,
                               Balance                           Additional
                                                                 Discount,
                                                                 Shipping
                                                                 Charges,
                                                                 Previous Balance

  Orders         COD Balance   IF(Payment Mode = \'Pre-Paid\',   Payment Mode,
                               0, Total - COD Advance)           Total (formula),
                                                                 COD Advance

  Orders         Is Copy       IF(Original Order, \'✅ Copy\',   Original Order
                               \'\')                             (self-link)

  Products       MRP w/o Tax   Price - (Price × Tax)             Price, Tax

  Packages       Treatment Id  PhoneNumber - AutoNumber          Phone Number
                                                                 (lookup), Id
                                                                 Autonumber

  Packages       Balance       Total Amount - Total Paid         Total Amount
                 Pending                                         (manual), Total
                                                                 Paid (rollup
                                                                 from
                                                                 Installments)

  Appointments   Appointment   PhoneNumber - (AutoNumber)        Phone (lookup
                 ID                                              from Customer),
                                                                 Auto Number

  Team           Sales Rollups SUM(linked Orders → Total) with   Orders → Total
                               date filters                      (formula), date
                                                                 range
  -------------- ------------- --------------------------------- ----------------

**10.2 Dependency Chain Impact**

If Products → Price changes: MRP w/o Tax recalculates → all Orders
containing that product see updated Products Sub Total (rollup) → Orders
Total recalculates → Team sales rollups update. This cascading
dependency means price changes retroactively affect all historical
calculations. For this reason, product prices should not be modified for
existing records without understanding the downstream impact.

**11. Revenue Attribution Data Flow**

**11.1 Attribution Fields Across Tables**

Revenue attribution follows a consistent pattern across all transaction
tables. Three key fields track who gets credit:

**Booked By:** The appointment team member who booked the original
appointment. This field is set at appointment creation and carried
forward to OTP, Packages, and Installments. It never changes, even if a
different counselor handles the actual visit.

**Select Councilor / Agent:** The counselor or agent who made the sale
or handled the transaction. This is the person directly responsible for
the revenue.

**Reporting To:** The manager of the Booked By agent. Used for
management-level commission and performance tracking.

**11.2 Attribution Flow by Transaction Type**

**OTP:** Booked By (manual/copied from appointment), Select Councilor
(manual), Reporting to (manual/lookup). Customer Type and New or
Cross-Sell set manually based on patient history.

**Packages:** Booked By (manual/copied), Select Councilor (manual),
Reporting To (manual/lookup). Customer Type and New or Cross-Sell set
manually.

**Installments:** Councilor (manual, per-visit). Booked By, Reporting
To, Customer Type, New or Cross-Sell all inherited via lookup from
parent Package --- ensuring every installment payment is attributed
consistently with the original package sale.

**Orders:** Agent (manual link to Team). Reporting To (lookup from Agent
→ Team). Order Type (New/Repeat) set manually.

**12. (S) Snapshot Fields --- Record Deletion Protocol**

To manage Airtable\'s record limits, old appointment records are
periodically deleted. Before deletion, critical appointment data is
copied to the linked transaction records (OTP, Packages, Installments)
in fields marked with the \'(S)\' suffix. This ensures essential
appointment context is permanently preserved.

**12.1 Snapshot Fields Copied**

  ---------------- -------------- ------------------------- ------------------
  **Field**        **Present In** **What It Captures**      **Why It Matters**

  Appointment ID   All three      The unique appointment    Permanent
  (S)                             identifier (PhoneNumber - cross-reference to
                                  AutoNumber)               original
                                                            appointment

  Visit No (S)     All three      Sequential visit number   Visit sequence
                                  for this patient          tracking without
                                                            appointment record

  Name (S)         All three      Patient name at time of   Patient
                                  appointment               identification
                                                            backup

  Clinic (S)       All three      Clinic where appointment  Location reference
                                  occurred                  backup

  Booking Advance  All three      Advance payment collected Financial
  / Advance Amount                at booking                reconciliation
  (S)                                                       

  Patient Opted    All three      Consultation outcome      Decision tracking
  for (S)                         (Package/Products/etc.)   

  Booked By (S)    All three      Who booked the            Attribution backup
                                  appointment               

  Reporting to (S) All three      Manager of booking agent  Management
                                                            attribution backup

  Consultation     Packages,      Consultation fee charged  Revenue
  Amount (S)       Installments                             reconciliation
  ---------------- -------------- ------------------------- ------------------

**12.2 Process**

1\. Identify appointment records eligible for deletion (typically old,
completed appointments). 2. For each appointment, locate all linked OTP,
Package, and Installment records. 3. Copy the snapshot field values from
the appointment to the corresponding (S) fields in the transaction
records. 4. Verify all (S) fields are populated correctly. 5. Delete the
appointment record. The transaction records now contain all essential
appointment context independently.

**13. Automation Triggers & Integration Points**

**13.1 Automation Trigger Fields**

  --------------------- -------------- ---------------- -------------------- ------------------
  **Field**             **Table(s)**   **Type**         **Trigger Behavior** **Purpose**

  N8N Check             OTP,           Text/Checkbox    Triggers N8N         Invoice
                        Installments                    workflows when set   generation, data
                                                                             sync

  N8N-Automation        Packages,      Text/Checkbox    N8N automation       Package lifecycle
                        Installments                    control field        automation

  Billing Automation    OTP            Number/Formula   Automation helper    Invoice data
                                                        for billing          preparation
                                                        workflows            

  Create Copy (Trigger) Orders         Checkbox         Triggers order       Replacement order
                                                        duplication          creation
                                                        automation           

  Balace Zero           Packages       Formula          Flags when Balance   Auto-triggers
  (Automation)                                          Pending = 0          Package Done
                                                                             status

  Copy Done             Packages,      Checkbox         Marks when (S) field Deletion readiness
                        Installments                    copy is complete     flag

  Empty Check           Installments   Formula          Validates required   Data integrity
                                                        fields are populated check

  Config                Config table   Number           Tracks round-robin   Lead
  (LastAssignedIndex)                                   position             auto-assignment
                                                                             via Make
  --------------------- -------------- ---------------- -------------------- ------------------

**13.2 Integration Map**

**Make (Integromat):** Lead round-robin assignment via Config table,
notifications, data sync between systems

**N8N:** OTP and Installment automation via N8N Check fields --- likely
invoice data preparation and notification triggers

**Airtable Native Sync:** Bidirectional sync of Contacts, Team, and
Appointments between Gleuhr Base and Clinic Base

**Power BI:** Connected to all transaction tables for performance
dashboards, trend analysis, and cross-filtering capabilities beyond
Airtable\'s native interface

**WooCommerce:** Website Orders synced via JWT Token authentication,
feeding online orders into Airtable

**Interakt / Ai Sensy:** WhatsApp messaging integration for lead capture
and customer communication

**IVR System:** Call logging with status, summary, and recording linked
to Lead records
