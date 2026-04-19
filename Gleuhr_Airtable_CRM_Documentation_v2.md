![Gleuhr
logo](media/f42e68e8b6557ec61ce3e1c3c84819f6751ebd7b.png "Gleuhr Logo"){width="1.25in"
height="1.25in"}

**GLEUHR**

Airtable CRM Structure &

Operational Workflows Documentation

*Internal Operations Document*

Prepared & Last Updated: February 2026

Classification: Confidential

**Table of Contents**

**1. Executive Summary**

Gleuhr operates its entire customer lifecycle, clinic operations,
product fulfilment, and team performance management through a
custom-built Airtable CRM. The system is split across two Airtable
accounts (the Gleuhr Base and the Clinic Base) and spans 23+
interconnected tables that serve as the single source of truth across
all clinics in Delhi, Haryana (Karnal), and Punjab (Chandigarh,
Ludhiana, Bathinda, Amritsar, Jalandhar).

The Gleuhr Base manages the customer lifecycle from lead to appointment,
online product orders, treatment plans, team directory, support tickets,
and system configuration. The Clinic Base handles clinic-side
transactions: one-time purchases (OTP), multi-session treatment
packages, and installment payments.

All team members interact with Airtable exclusively through Interfaces
(not raw table access), providing role-based data visibility and
record-level access control. Performance analytics are powered by Power
BI connected to Airtable, enabling richer reporting than Airtable's
native interface filters allow.

This document maps the complete two-base architecture, explains each
table's purpose and workflow, describes cross-base relationships, and
documents the SOPs running on this system.

**2. System Architecture Overview**

**2.1 Two-Base Architecture**

Due to Airtable's record limits, Gleuhr's CRM is split across two
separate Airtable accounts:

  ------------- ----------------- ------------------ -------------------------
  **Base**      **Account**       **Primary          **Key Tables**
                                  Purpose**          

  Gleuhr Base   Account 1         Customer           Lead, Contacts, New
  (Main)        (MCP-connected)   lifecycle, online  Appointments, Orders,
                                  sales, team        Treatment Plan, Products,
                                  management,        Diet Plan, Team, Customer
                                  support            Tickets, Config + 10 more

  Clinic Base   Account 2         Clinic-side        OTP, Packages,
                (separate)        transactions and   Installments + synced
                                  payment tracking   copies of Contacts, Team,
                                                     Appointments
  ------------- ----------------- ------------------ -------------------------

The Contacts, Team, and Appointments tables are natively synced between
the two bases using Airtable's built-in sync feature. The Appointments
table is the primary bridge --- its Appointment ID (format:
PhoneNumber - (AutoNumber), e.g., 9711280397 - (16332)) serves as the
universal cross-base identifier.

**2.2 Record Management Strategy**

To stay within Airtable's record limits, old appointment records are
periodically deleted from the Appointments table. Before deletion,
critical fields are copied to the linked OTP, Package, or Installment
record for permanent reference. These snapshot fields are identified by
the "(S)" suffix:

-   Appointment ID (S), Visit No (S), Name (S), Clinic (S)

-   Booking Advance/Advance Amount (S), Patient Opted for (S)

-   Booked By (S), Reporting to (S), Consultation Amount (S)

Once copied, the appointment record is safely deleted while the
essential data persists in the transaction tables.

**2.3 Table Inventory**

**Gleuhr Base (20 tables)**

  --------------- ------------------------ -------------------------------
  **Category**    **Tables**               **Purpose**

  Customer        Lead, Contacts, New      End-to-end patient journey from
  Lifecycle       Appointments             enquiry to clinic visit

  Revenue &       Orders, Treatment Plan,  Product orders, treatment
  Fulfilment      Products, Diet Plan      packages, diet plans, product
                                           catalog

  Team &          Team, Agent Targets      Staff directory, target
  Performance     Monthly, Agent Targets   setting, performance rollups
                  Contest                  

  Support &       Customer Tickets, Clinic Complaint management, clinic
  Quality         Reviews, Internal Issue  audits, internal issue tracking
                  Tickets                  

  Operations &    Dispatch Tracking Id,    Logistics, e-commerce sync,
  Config          Website Orders, Whatsapp WhatsApp ad tracking,
                  Leads Tracker,           influencer payouts, SOPs,
                  Influencer, Guide,       system config
                  Config, Orders JWT Token 
  --------------- ------------------------ -------------------------------

**Clinic Base (3 core tables + 3 synced tables)**

  --------------- ------------------------ -------------------------------
  **Category**    **Tables**               **Purpose**

  Clinic          OTP (One-Time Purchases) Products, services, and diet
  Transactions                             sold at clinic as single
                                           payments

  Clinic          Packages                 Multi-session treatment
  Transactions                             packages sold at the clinic

  Clinic          Installments             Individual payment records
  Transactions                             against packages (one per
                                           visit)

  Synced Tables   Contacts, Team,          Natively synced from Gleuhr
                  Appointments             Base for cross-reference
  --------------- ------------------------ -------------------------------

**2.4 Entity Relationship Map**

The core data flow follows a patient-centric model where Contacts is the
master patient record:

-   **Lead** (enquiry) → **Contacts** (patient record) → **New
    Appointments** (clinic visits)

-   **Contacts** → **Orders** (online product purchases) + **Treatment
    Plan** (online packages) + **Diet Plan**

-   **New Appointments** → **OTP** (one-time clinic purchases) OR
    **Packages** (multi-session clinic packages)

-   **Packages** → **Installments** (individual visit payments against a
    package)

-   **Team** links to all transaction tables via agent assignment for
    performance tracking in Power BI.

The split is simple: if the patient pays in full at the clinic → OTP. If
they sign up for a multi-session treatment with installment payments →
Packages + Installments. Online product orders flow through Orders in
the Gleuhr Base.

**3. Gleuhr Base --- Detailed Table Breakdown**

**3.1 Team (Staff Directory & Performance Hub)**

Central staff directory serving as the anchor for all performance
tracking. Every sales agent, appointment coordinator, clinic counselor,
receptionist, dietician, and manager has a record here.

**Key Fields**

  ------------------------------ -------------- ----------------------------------------
  **Field**                      **Type**       **Purpose**

  Agent Account                  Collaborator   Airtable user account for login-based
                                                views and permissions

  Councilor Name                 Text           Display name for the team member

  Reporting To                   Single Select  Manager or clinic assignment (Vikram,
                                                Kiran, Sarika, Ruby, Priya, Tejinder,
                                                Shalini, Saurabh, or clinic names)

  Department                     Multi-Select   Roles: Sales Team, Appointment Team,
                                                Clinic Councilor, BM, Reception Team,
                                                Doctor, Operations, Dietitian, etc.

  Clinic                         Single Select  Home clinic: Chandigarh, Ludhiana,
                                                Bathinda, Delhi, Amritsar, Jalandhar

  Daily/Weekly/Monthly/Contest   Number         Targets set by management
  Goal                                          

  Daily/Weekly/Monthly/Contest   Rollup         Auto-calculated from linked Orders table
  Sale                                          

  Package Amount (New/Ongoing)   Rollup         Splits revenue by new vs. ongoing
                                                patients across time periods

  Installment/OTP Amount         Rollup         Tracks installment and one-time payment
                                                collections separately
  ------------------------------ -------------- ----------------------------------------

Each team member is linked to Leads, Orders, Appointments, Customer
Tickets, and Treatment Plans. Rollup fields provide real-time
operational data. Detailed performance analytics (charts, trends,
cross-filtering) are handled in Power BI.

**3.2 Lead (Enquiry Management)**

Captures and tracks every incoming enquiry from first touch to
conversion or disqualification. This is the top of the funnel.

**Key Fields**

  ------------------ -------------- ----------------------------------------
  **Field**          **Type**       **Purpose**

  Phone Number       Number         Primary identifier for deduplication

  Status             Single Select  New Lead → Contacted → Cold → Warm → Hot
                                    Lead → Converted / Not Converted / Dead
                                    Lead / Transfer To Online

  Lead Concern       Multi-Select   Pigmentation/Blemishes, Wrinkles/Ageing,
                                    Acne/Scars, Dull Skin, Under-eye, etc.

  Lead Source        Single Select  Interakt-Appointment, Interakt-Product,
                                    Ai Sensy, WhatsApp, Social Media,
                                    Website-Gleuhr, IVR, Qualified Lead,
                                    DigiPanda

  Owner              Link to Team   Assigned sales agent

  Follow Up Date /   Date + Select  Next follow-up date with tracking
  Status                            (Pending, Done, Not Picked)

  Converted For      Single Select  Order or Appointment --- defines
                                    conversion type

  Stale 30day Flag   Formula        Auto-flags leads stuck in
                                    Warm/Hot/Contacted for 30+ days

  UTM / Campaign     Text/URL       Full ad attribution data from
  fields                            Meta/Google campaigns
  ------------------ -------------- ----------------------------------------

**Lead Lifecycle**

1.  Lead arrives via Meta ads, WhatsApp, IVR, website, or social media.
    Record created automatically (Make/Interakt) or manually.

2.  Config table manages round-robin assignment to sales agents
    automatically.

3.  Agent works the lead: New Lead → Contacted → Warm/Hot → Converted.

4.  Follow-up dates tracked with formula-based auto-scheduling for Not
    Responding leads.

5.  On conversion, lead linked to Order or Appointment. Contacts record
    created/linked.

6.  Stale 30-day Flag auto-surfaces cold leads, preventing pipeline rot.

**3.3 Contacts (Master Patient Record)**

The central patient record with 148 fields. Once a lead converts or a
walk-in arrives, a Contacts record is created. Single source of truth
for everything about a patient.

**Key Field Groups**

  --------------- --------------------------- ----------------------------
  **Group**       **Fields**                  **Purpose**

  Identity        First Name, Last Name,      Core patient demographics
                  Phone, Email, Address,      and contact info
                  City, Pin Code, Country,    
                  Age, Gender, Occupation     

  Clinical        Concern, Fitzpatrick        Medical intake data for
  Profile         Classification, Skin Type,  doctors and counselors
                  Medical History, Known      
                  Allergies, Medications,     
                  Treatment taken before      

  Treatment       Treatment Recommended       Doctor prescription mapped
  Planning        (1-5), Sittings per service to treatments
                  (1-5), Sitting Dates,       
                  Supplements/Products        
                  Recommended                 

  Financial       Orders total amount,        Lifetime value tracking and
                  Treatment Plan total        budget awareness
                  amount, Monthly Budget      

  Diet Management Diet Plan Status,           Full diet plan lifecycle
                  Dietician, Diet Plan, Diet  
                  Start/End Date,             
                  Hold/Extended Status,       
                  Weekly Follow Up            

  Patient         Patient Results,            Clinical outcomes and
  Experience      Appointment reviews,        before/after photos
                  Patient Photos, Patient     
                  History, Prescription       

  Engagement      Call Status (NP), FollowUp  Outreach and engagement
  Tracking        Date/Status (NP), WA        touchpoints
                  message Status, Diet Plan   
                  Pitched, Info Form          

  Linked Records  Orders, New Appointment,    Connects to all transactions
                  Treatment Plan, Customer    and interactions
                  Tickets, Diet Plan, Lead    
                  Number, Dietician (Team)    
  --------------- --------------------------- ----------------------------

Contacts is the hub of the CRM. Opening a patient record shows their
complete history: every order, appointment, treatment plan, diet plan,
complaints, clinical photos, and doctor prescriptions. Clinical profile
fields are populated during patient intake via digital forms.

**3.4 New Appointments (Clinic Visit Management)**

Manages the full appointment lifecycle from booking through visit
completion, consultation, and post-visit feedback. The most complex
table (154 fields) and the clinic operations nerve center. Natively
synced between both bases.

**Key Field Groups**

  --------------- ----------------------------------------------------- -------------------------
  **Group**       **Key Fields**                                        **Purpose**

  Booking         Appointment ID, Customer, Appointment Date, Clinic,   Booking details and
                  Customer Type (New/Revisit/Walk-In), Budget, Booking  advance payment
                  Advance                                               

  Clinic          Clinic Status (Booked → Payment Received → Visit Done Patient flow on visit day
  Operations      → No Show → Cancelled), Walk-In, Doctor, Clinic       
                  Councilor                                             

  Consultation    Patient Opted For (Package/Single                     What happened during
  Outcome         Session/Products/Consultation/Token/On-going/Diet),   consultation
                  Non-Conversion Reason                                 

  Doctor          Treatment Recommended (1-10), Sittings per service    Up to 10 treatment lines
  Prescription    (1-10), Sitting Dates (1-10), Products/Supplements    
                  Recommended                                           

  Feedback        Councilor, Doctor, Treatment, Clinic Hygiene,         Multi-dimensional patient
                  Reception, Therapist, Wait Time Feedback              ratings

  Post-Visit      Feedback Call Status, FollowUp Call Date, Customer    Follow-up and concern
                  Concern, Action Taken                                 resolution

  Clinical        Before & After Images, Sitting Details, Patient       Treatment documentation
  Records         Result, Doctor Prescription, Doctor Notes             
  --------------- ----------------------------------------------------- -------------------------

**Record Deletion Protocol:** Old appointment records are periodically
deleted to manage record limits. Before deletion, critical fields
(Appointment ID, Visit No, Name, Clinic, Booking Advance, Patient Opted
For, Booked By, Reporting To, Consultation Amount) are copied to the
linked OTP, Package, or Installment record as (S) fields.

**Appointment Lifecycle**

1.  Booking: Record created by appointment team or reception, linked to
    Contact.

2.  Advance collected, payment proof attached, verified by operations.

3.  Visit Day: Status moves Booked → Payment Received → Visit Done.
    Doctor fills prescription.

4.  Counselor presents treatment plan, patient decides
    (Package/Products/Consultation/etc.).

5.  If one-time purchase → OTP record in Clinic Base. If multi-session →
    Package record in Clinic Base.

6.  Post-visit feedback call assigned (multi-dimensional ratings).

7.  Before deletion, appointment data copied to (S) fields in linked
    transaction records.

**3.5 Orders (Product Sales & Fulfilment)**

Tracks every product order from creation through payment verification,
invoicing, dispatch, and delivery. Supports online (D2C) and in-clinic
sales. Lives in the Gleuhr Base (not to be confused with OTP in the
Clinic Base).

**Key Field Groups**

  --------------- ------------------------------ -------------------------
  **Group**       **Key Fields**                 **Purpose**

  Order Basics    Order Id (auto), Select        Order composition and
                  Customer, Agent, Order Type    pricing
                  (New/Repeat), Select Products, 
                  Discount %, Total (formula)    

  Status Pipeline Agent Status: Payment Pending  Dual-track status
                  → Send For Verification. Ops   
                  Status: Pending Verification → 
                  Ready For Invoice → Ready For  
                  Dispatch                       

  Payment         Payment Mode (Pre-Paid/COD),   Payment collection and
                  Payment Proof, Payment         verification
                  Verified, Payment Received On  

  Fulfilment      Dispatch Mode (Courier/Clinic  End-to-end dispatch
                  Pickup), Invoice               
                  Created/Number/Attachment,     
                  Tracking Id, Delivery Location 

  Quality         Dispatched Issues, Resolution  Issue tracking and
                  Provided, Complaint Status     resolution

  Diet            Dietician, Diet Plan Pitched,  Post-sale diet plan
  Integration     Call Status, Follow Up Date    upsell
  --------------- ------------------------------ -------------------------

**Order Lifecycle**

1.  Agent creates order with products and pricing. Total
    auto-calculates.

2.  Agent attaches payment proof, moves to Send For Verification.

3.  Operations verifies payment, moves to Order Ready For Invoice.

4.  Accounts creates invoice manually, moves to Order Ready For
    Dispatch.

5.  Dispatch team picks, packs, adds tracking ID, ships.

6.  Diet team follows up for diet plan pitch.

**3.6 Treatment Plan (Online Package Management)**

Manages multi-session treatment packages from the online/sales side.
While Packages in the Clinic Base track clinic-side sessions and
installments, Treatment Plans manage product fulfillment: plan length,
monthly dispatches, and balance tracking.

**Key Fields**

  ------------------ --------------- ------------------------------------
  **Field**          **Type**        **Purpose**

  Treatment ID       Formula         Auto-generated: TP-{auto number}

  Select Plan Length Single Select   1 to 8 months

  Select Product     Link to         Products included in the package
                     Products        

  Orders             Link to Orders  Monthly orders fulfilling this plan

  Total Paid         Rollup          Sum of all payments received

  Balance Pending    Formula         Plan total minus total paid

  Alert              Formula         Flags negative balances exceeding
                                     -500

  Operations Status  Single Select   Pending Verification → Ready For
                                     Invoice → Ready For Dispatch →
                                     Dispatched
  ------------------ --------------- ------------------------------------

**3.7 Products (Product Catalog)**

Master product catalog used by Orders, Treatment Plans, Diet Plans, and
Website Orders. Contains all Gleuhr skincare products, treatment
services, and diet plans. A similar Products table exists in the Clinic
Base for OTP and Package product selection.

  ------------------ --------------- ------------------------------------
  **Field**          **Type**        **Purpose**

  Product Name       Text            Product/service name

  Price              Number          MRP

  Product Status     Checkbox        Active/inactive toggle

  Product Category   Single Select   Product, Treatment Plan, or Diet

  HSN Product Wise   Text            HSN code for GST invoicing

  Tax                Percent         GST rate

  MRP w/o Tax        Formula         Reverse-calculated pre-tax price
  ------------------ --------------- ------------------------------------

**3.8 Diet Plan**

Manages personalized diet plans alongside treatments. Links to Treatment
Plans and Contacts.

Workflow: Assignment (Call Pending → Call Done) → Diet Status (Intro
Call Pending → Google Form Shared → Diet Plan Pending → Diet Plan
Shared) → Active Management (Active Diet / On Hold / Inactive) → Weekly
Follow-ups → Renewal tracking.

**4. Clinic Base --- Detailed Table Breakdown**

The Clinic Base (2nd Airtable account) houses three core transaction
tables tracking all clinic-side revenue. Contacts, Team, and
Appointments are synced from the Gleuhr Base via native Airtable sync.
The revenue split: full payment at clinic → OTP. Multi-session treatment
with installments → Packages + Installments.

**4.1 OTP --- One-Time Purchases**

Tracks products, services, or diet sold at the clinic as a single
payment during a visit. Linked to the appointment that triggered the
sale.

**Key Field Groups**

  --------------- ------------------------------ -------------------------
  **Group**       **Key Fields**                 **Purpose**

  Identity        Order Id (OT-{number}), OT     Unique order
                  Auto-number, Phone Number,     identification
                  Name                           

  Attribution     Select Councilor, Team, Booked Who booked, who sold,
                  By, Reporting To, Customer     revenue segmentation
                  Type (New/Revisit/Walk-In),    
                  New or Cross-Sell              

  Products        Select Product, Product        Products with pricing,
                  Discount, Product Dis%, Price, discounts, tax compliance
                  Sub Total, Product w/o MRP,    
                  Product HSN, Product Tax       

  Services        Select Services, Services      Treatment services with
                  Discount, Services Dis %,      pricing and tax
                  Price, Sub Total, Service w/o  
                  MRP, Service HSN, Service Tax  

  Diet            Select Diet, Diet Discount,    Diet plans with pricing
                  Diet Dis %, Price, Sub Total,  and tax
                  Diet w/o MRP, Diet HSN, Diet   
                  Tax                            

  Complimentary   Complimentary products,        Free products given with
                  Complimentary Count, Price,    purchase
                  Tax, HSN, MRP w/o Tax          

  Financial       Total, Subtotal, Tax, COD      Payment totals and method
                  Amount, Payment Mode           
                  (UPI/Cash/Card/Bank Transfer), 
                  Total Receivable               

  Invoicing       Invoice created (checkbox),    Manual invoice tracking
                  Invoice Status, Ledger Updated by accounts
                  (checkbox), Payment Proof      

  Appointment     Appointment ID (S), Visit No   Preserved data from
  Snapshot        (S), Name (S), Clinic (S),     deleted appointments
                  Booking Advance (S), Patient   
                  Opted for (S), Booked By (S),  
                  Reporting to (S)               
  --------------- ------------------------------ -------------------------

**Booked By** always refers to who booked the original appointment ---
consistent across all tables (OTP, Packages, Installments,
Appointments).

**Tax Compliance:** Each category has its own HSN and tax rate. Typical:
5% supplements (HSN 21069099), 18% cosmetics/serums (HSN 33049990), 5%
services (HSN 999722), 5% diet (HSN 999319).

**4.2 Packages --- Multi-Session Treatment Plans**

Records multi-session treatment packages sold at the clinic. Gleuhr's
primary high-value clinic offering. When a patient commits to a
treatment spanning multiple sessions (e.g., Pigmentation Package --- 12
sessions), a Package record is created. Payments across visits are
recorded as Installments.

**Key Fields**

  --------------------- --------------- ------------------------------------
  **Field**             **Type**        **Purpose**

  Treatment Id          Formula         PhoneNumber-AutoNumber (e.g.,
                                        9711280397-4766)

  Treatment Name        Link to         Standardized name from Products
                        Products        table (Pigmentation Package, LHR
                                        Full Body, Maintenance Package,
                                        Customised Package Treatment, etc.)

  Select Appointment    Link            Appointment during which package was
                                        sold

  Select Councilor /    Link / Text     Counselor who sold the package
  Team                                  

  Booked By             Text            Who booked the original appointment

  Reporting To          Text            Manager for commission attribution

  Customer Type         Single Select   New Patient or Revisit

  New or Cross-Sell     Single Select   First package vs. additional package

  Total Amount          Number          Full package price

  Total Paid            Rollup          Sum of all installment payments

  Balance Pending       Formula         Total Amount minus Total Paid

  Installment Paid      Linked Records  Links to all Installment records for
                                        this package

  IP-Count (Automation) Count/Formula   Count of installments --- used in
                                        automation logic

  Package Status        Single Select   Balance Pending / Package Done

  Clinic                Single Select   Delhi, Chandigarh, Ludhiana,
                                        Bathinda, Amritsar, Jalandhar,
                                        Karnal

  Appointment Snapshot  Various         Preserved data from deleted
  (S) fields                            appointment records
  --------------------- --------------- ------------------------------------

Lifecycle: Created at clinic → First installment recorded → Subsequent
payments added as Installments → Balance Pending decreases → Package
Done when fully paid.

**4.3 Installments --- Visit Payment Records**

Each record = one payment event against a Package. When a patient comes
for a session and pays, an Installment captures the amount,
products/services given, and invoicing details.

**Key Fields**

  ---------------------- ---------------- ------------------------------------
  **Field**              **Type**         **Purpose**

  Balance Payment Id     Auto-number      Unique installment identifier

  Select Package         Link to Packages Parent package this payment belongs
                                          to

  Installment No         Number           Sequence number (1, 2, 3\...)

  Visit Amount Paid /    Number           Amount paid this visit
  Total                                   

  Date Of Visit          Date             Payment date

  Payment Mode           Single Select    UPI, Cash, Card, Bank Transfer

  Select Product /       Links            What was given during this visit
  Service / Diet                          

  Product/Service/Diet   Number           Per-category totals
  Sub Total                               

  Product/Service/Diet   Number/Percent   Discounts per category
  Discount                                

  Total Receivable       Formula          Final amount after discounts

  Complimentary Products Link             Free products given

  Invoice created /      Checkbox/Text    Manual invoice tracking
  Invoice Status /                        
  Ledger Updated                          

  Payment Proof          Attachment       Receipt or screenshot
  ---------------------- ---------------- ------------------------------------

**Inherited Fields from Parent Package**

Installments inherit key fields from their parent Package for reporting
and invoicing:

-   Booked By, Reporting To (from Packages) --- commission attribution
    to original appointment booking

-   New or Cross-Sell, Customer Type (from Packages) --- revenue
    segmentation

-   Treatment Name, Tax (from Treatment Name) (from Packages) ---
    package details and tax rates

-   HSN Product wise (Package), Tax (services) (from Packages) --- GST
    compliance

**Tax Compliance:** Each installment tracks HSN codes and tax rates
independently for Products, Services, Diet, and Complimentary items,
supporting accurate GST invoicing.

**5. Support & Quality Tables**

**5.1 Customer Tickets**

Structured complaint management. Tickets categorized by concern (Clinic
Cleanliness, Wait Time, Doctor Explanation, Staff Friendliness,
Treatment Results, Products Issues, Rescheduling) and routed to Doctor
and/or Branch Manager via Agent Status field. Each party has independent
Call Status and Notes fields for parallel resolution. Resolution time
auto-calculated.

**5.2 Clinic Reviews**

Proactive quality check visits. Tracks patient name, phone, clinic,
visit number, assignee, status (Todo/In Progress/Done), and next visit
date.

**5.3 Internal Issue Tickets**

Internal team issue tracking. Issues assigned to owner (Inder, Runu,
Komal), tracked through Pending → Working On It → Done. Resolution time
calculated, SOP Check formula validates process compliance.

**6. Operations & Configuration Tables**

**6.1 Dispatch Tracking Id**

Logistics reference mapping Reference Numbers, Receiver Mobile, Invoice
Numbers, AWB Numbers, and Order Numbers for shipment tracking.

**6.2 Website Orders**

Synced from WooCommerce. Captures Order ID, Phone, Status, Order Total,
Payment Method, Discount/Shipping/Tax breakdowns, and product links.
Feeds online orders into Airtable.

**6.3 Whatsapp Leads Tracker**

Daily WhatsApp ad performance tracking by agent. Each row = date,
columns track spend and message count per agent for daily ROI
monitoring.

**6.4 Influencer**

Influencer payment processing: details, bank info, invoice attachments,
amounts, payment status (Payment Required / Payment Done).

**6.5 Guide**

Internal SOP library. Each record links a guide name to a URL by
department (Online Sales, Appointment, Reception, Councilor). Houses
treatment guides and sales scripts.

**6.6 Config**

System configuration with Teams and LastAssignedIndex fields powering
round-robin lead assignment automation.

**6.7 Agent Targets (Monthly & Contest)**

Two tables setting agent targets. Each links to Team with a target
number and date period for monthly and contest tracking.

**6.8 Orders JWT Token**

JWT tokens for API authentication used by the WooCommerce-to-Airtable
integration.

**7. Key Workflows & SOPs**

**7.1 Lead-to-Patient Conversion**

  ---------- -------------- --------------------------------- -----------------
  **Step**   **Table**      **Action**                        **Owner**

  1          Lead           Lead created (auto or manual)     System /
                            from Meta/WhatsApp/IVR/Website    Marketing

  2          Config + Lead  Round-robin assignment to sales   System (Make)
                            agent                             

  3          Lead           Agent calls, updates Status, sets Sales Agent
                            follow-up                         

  4          Lead           Conversion: status = Converted,   Sales Agent
                            Converted For = Appointment or    
                            Order                             

  5          Contacts       Patient record created/linked     Sales / Reception
                            with demographics                 

  6a         New            If appointment: booking with      Appointment Team
             Appointments   advance, verified                 

  6b         Orders         If order: created with products,  Sales Agent
                            pricing, payment                  

  7          Lead           Stale 30-day flag for stuck leads System (formula)
  ---------- -------------- --------------------------------- -----------------

**7.2 Clinic Visit & Transaction Flow**

The critical cross-base workflow:

  ---------- --------------- ------------------------------- -----------------
  **Step**   **Table /       **Action**                      **Owner**
             Base**                                          

  1          Appointments    Appointment confirmed, advance  Appointment Team
             (Both)          collected, synced across bases  

  2          Appointments    Patient arrives, balance        Reception
                             collected. Status → Payment     
                             Received                        

  3          Appointments    Doctor consultation,            Doctor
                             prescription filled             

  4          Appointments    Counselor presents options,     Clinic Counselor
                             patient decides                 

  5a         OTP (Clinic     One-time purchase: OTP record   Counselor /
             Base)           with products, services, diet,  Reception
                             payment                         

  5b         Packages        Multi-session package: Package  Counselor /
             (Clinic Base)   record with treatment, amount,  Reception
                             first installment               

  6          Installments    Subsequent visit payments       Counselor /
             (Clinic)        create new Installment records  Reception

  7          Appointments    Feedback call assigned          Feedback Team
                             (multi-dimensional ratings)     

  8          Appts →         Before deletion: critical       System /
             OTP/Pkg/Inst    fields copied to (S) fields in  Operations
                             transaction records             
  ---------- --------------- ------------------------------- -----------------

**7.3 Order Fulfilment (Gleuhr Base)**

  ---------- ---------------- ------------------------------ -----------------
  **Step**   **Status**       **Action**                     **Owner**

  1          Payment Pending  Agent creates order with       Sales Agent
                              products and pricing           

  2          Send For         Payment proof attached,        Sales Agent
             Verification     submitted                      

  3          Pending          Operations reviews payment     Operations
             Verification                                    

  4          Ready For        Payment verified, invoice      Accounts
             Invoice          created manually               

  5          Ready For        Products picked and packed     Dispatch Team
             Dispatch                                        

  6          Dispatched       Tracking ID added, shipped     Dispatch Team

  7          Post-Dispatch    Diet plan pitched, issues      Diet / Ops
                              tracked                        
  ---------- ---------------- ------------------------------ -----------------

**7.4 Package & Installment Lifecycle (Clinic Base)**

  ---------- -------------- --------------------------------- -----------------
  **Step**   **Table**      **Action**                        **Owner**

  1          Packages       Patient commits. Package record:  Clinic Counselor
                            Treatment Name, Total Amount      

  2          Installments   First installment: payment,       Reception /
                            products/services given, mode     Counselor

  3          Packages       Total Paid rollup updates,        System
                            Balance Pending recalculates      

  4          Installments   Each visit: new Installment with  Reception /
                            payment and products              Counselor

  5          Installments   Accounts generates invoice, marks Accounts
                            checkboxes                        

  6          Packages       Balance = 0 → Package Status =    System /
                            Package Done                      Counselor
  ---------- -------------- --------------------------------- -----------------

**7.5 Diet Plan Workflow**

  ---------- --------------------- -------------------------------------------
  **Step**   **Status**            **Action**

  1          Call Pending          Dietician assigned, intro call scheduled

  2          Intro Call Pending    First call to understand patient needs

  3          Google Form Shared    Patient fills health/diet questionnaire

  4          Diet Plan Pending     Dietician creates personalized plan

  5          Diet Plan Shared      Plan delivered to patient

  6          Active Diet           Weekly follow-ups, diet tips shared

  7          On Hold / Extended    Plan paused or extended as needed
  ---------- --------------------- -------------------------------------------

**7.6 Invoicing Workflow**

Invoicing is fully manual across all transaction tables (Orders, OTP,
Installments):

1.  Transaction record created with products, pricing, payment details.

2.  Accounts team generates invoice externally (outside Airtable).

3.  Accountant ticks Invoice Created checkbox in Airtable.

4.  Invoice Status updated to "Invoice Created."

5.  Ledger Updated checkbox ticked after accounting ledger updated.

**8. Performance Tracking Architecture**

**8.1 Reporting Stack**

-   **Airtable (operational layer):** Team table rollups provide
    real-time sales data by time period, patient type, and payment type.

-   **Power BI (analytics layer):** Connected to Airtable for charts,
    trends, cross-filtering, and multi-dimensional dashboards. Adopted
    because Airtable Interface filters were too rigid.

**8.2 Revenue Attribution**

-   **Agent Level:** Booked By (appointment booker), Select Councilor
    (seller), Reporting To (manager) on every transaction.

-   **Patient Type:** Customer Type + New or Cross-Sell for acquisition
    vs. monetization tracking.

-   **Clinic Level:** Clinic field across all tables for per-location
    revenue.

-   **Payment Type:** Package Amount, Installment Amount, OTP Amount for
    financial segmentation.

**8.3 Target Management**

Agent Targets Monthly and Agent Targets Contest tables link to Team with
targets and dates. Power BI combines actuals with targets for variance
and achievement analysis.

**9. Access Control & Interface Strategy**

**9.1 Interface-First Access Model**

All team members interact with Airtable exclusively through Interfaces.
Nobody has direct table access. This serves as the access control layer:

-   **Role-based visibility:** Each role sees only relevant fields and
    records via Interface design.

-   **Record-level access:** Counselors can't see other clinics' data;
    agents can't modify operations fields.

-   **Data integrity:** No accidental field deletions, formula changes,
    or view modifications.

-   **Simplified UX:** Clean, purpose-built forms and dashboards instead
    of 100+ field tables.

**9.2 View Strategy**

-   **Agent-Specific Views:** Named views per agent for personalized
    workspaces.

-   **Synced Views:** Locked views for Make/N8N automations. Labeled "Do
    Not Change."

-   **Operational Views:** Payment View, Revenue Track, Feedback, Pickup
    Orders, Dispatched Orders.

-   **Clinic-Specific Views:** Per-clinic reception sale views on Orders
    table.

**10. Integrations & Automations**

  ----------------- ------------------------ -------------------------------
  **Integration**   **Tables Involved**      **Purpose**

  Make (Integromat) Lead, Config, Team       Round-robin assignment,
                                             notifications, data sync

  N8N               OTP, Installments        Automation triggers via N8N
                    (Clinic Base)            Check field

  Interakt / Ai     Lead                     WhatsApp messaging and lead
  Sensy                                      capture

  WooCommerce       Website Orders,          E-commerce order sync
                    Products, JWT Token      

  IVR System        Lead                     Call logging with status,
                                             summary, recording

  WhatsApp (manual) Whatsapp Leads Tracker   Daily agent spend and message
                                             tracking

  Meta Ads          Lead                     Campaign and UTM attribution

  Patient Forms     Contacts, Appointments   Digital intake forms

  Airtable Native   Contacts, Team,          Bidirectional sync between
  Sync              Appointments             bases

  Power BI          All transaction tables   Performance dashboards and
                                             analytics
  ----------------- ------------------------ -------------------------------

**11. Observations & Improvement Opportunities**

  ------------- ---------------------------- ----------------------------
  **Area**      **Observation**              **Recommendation**

  Field Bloat   Orphaned/copy fields across  Audit and remove unused
                tables (artifacts of sync or fields
                experiments)                 

  Duplicate     Manual dedup via checkboxes  Automate deduplication on
  Prevention    on Lead, Contacts, Orders    phone number via Make

  Data          Treatment Recommended split  Standardize field types and
  Consistency   differently between Contacts counts
                (5) and Appointments (10)    

  Record Limits Deleting appointments and    Consider archive base or
                copying to (S) fields        plan upgrade
                creates data fragmentation   

  Two-Base      Two accounts add             Document all cross-base
  Complexity    sync/automation complexity   dependencies formally

  Invoice       Fully manual invoice         Integrate with accounting
  Automation    generation and checkbox      software (Zoho Books, Tally)
                tracking                     

  Formula       Complex nested formulas      Document all formulas in
  Complexity    truncated in schema          separate reference sheet

  View Naming   Inconsistent naming (Test,   Adopt: {Department} -
                Test1)                       {Function} - {Filter}

  Scalability   148 fields on Contacts, 154  Split clinical records into
                on Appointments nearing      separate linked table
                limits                       
  ------------- ---------------------------- ----------------------------

*--- End of Document ---*
