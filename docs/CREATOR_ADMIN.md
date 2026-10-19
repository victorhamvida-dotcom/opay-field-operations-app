# Creator / Admin Guide

**OPay Field Operations App · Hamvida Tech**

---

## Creator login

- Portal → **Creator**
- Password only (no name/code)
- Signs in as **Hamzat Victor Chisom**

---

## A. Staff Admin

Open **Staff Admin**

### Directory
- Search staff
- Filter by role
- See gender, region/state, status
- Lock / Activate accounts
- Gender totals + by-role breakdown

### Manual create (verified exceptions)
Use when self-registration is blocked but identity is legitimate.

Supports:
- DH without Region/State  
- RM multi-region / multi-state / supervised RMs  
- SM/CDLM state lists  
- Gender required  
- Confirmation screen before create  
- Never overwrites existing Login ID  

---

## B. Password Reset Console

Open **Reset Pass**
- Search locked/pending field users
- Generate or set temporary password
- Copy credentials for WhatsApp dispatch

---

## C. Game Studio (multi-game platform)

### Catalog (7 system games + Creator games)
1. Career Money Run  
2. Policy Quiz Arena  
3. Merchant Case Desk  
4. POS Tier Climber  
5. Compliance Gauntlet  
6. Loan Disbursement Sprint  
7. Warning & Exit Simulator  

### Create Game Type
Add new modes with:
- name, tagline, description  
- categories (for DH matching)  
- keywords  
- difficulty / duration  
- icon & color  

### Recommend tab
Paste SOP/policy → ranked game suggestions (same engine DH uses).

### Versions
- Real-time date/time/year stamps  
- Manual checkpoints  
- Rollback to last good configuration  
- Safety snapshot before every rollback  

---

## D. Good vs old-school guidance

**Do**
- Add game types that map to real SOP categories  
- Keep shared platform shell (auth, hierarchy, analytics)  
- Use version checkpoints before big policy pushes  

**Don’t**
- Create random disconnected mini-games with no policy mapping  
- Bypass duplicate Login ID protection  
- Silently overwrite staff Region/State  

---

## Production hardening (next phase)

- Backend auth + hashed passwords  
- Server-side staff registry  
- Role-based API permissions  
- Audit log export  
- Official OPay legal/brand review  

---

Hamvida Tech · github.com/victorhamvida-dotcom
