# Quick Test Guide - Field-to-Invoice Features

## 🚀 Setup (5 minutes)

### 1. Fix Database Migration

Run this SQL in Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/sql):

```sql
-- Fix voor gedeeltelijk toegepaste migratie
DROP POLICY IF EXISTS "Users can manageown draft_sessions" ON draft_sessions;
DROP POLICY IF EXISTS "Users can manage own draft_sessions" ON draft_sessions;
DROP POLICY IF EXISTS "Users can manage own invoice_lines" ON invoice_lines;

CREATE POLICY "Users can manage own draft_sessions" 
ON draft_sessions FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own invoice_lines" 
ON invoice_lines FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM facturen 
        WHERE facturen.id = invoice_lines.invoice_id 
        AND facturen.user_id = auth.uid()
    )
);

CREATE TRIGGER update_draft_sessions_updated_at 
BEFORE UPDATE ON draft_sessions 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_lines_updated_at 
BEFORE UPDATE ON invoice_lines 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
```

### 2. Add Gemini API Key (Optional)

Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

Add to `.env.local`:
```bash
VITE_GEMINI_API_KEY=your_api_key_here
VITE_DEMO_MODE=false
```

**Note**: If you skip this, the app will use mock AI responses (still works!)

### 3. Restart Dev Server

```bash
npm run dev
# or
pnpm dev
```

## 🧪 Test Scenarios

### Test 1: Media Upload (2 minutes)

1. Open browser console (F12)
2. Run this code:

```javascript
// Test media upload
const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const { uploadFile } = await import('/src/lib/media-service.ts');

const result = await uploadFile(testFile, 'test-site-id', {
  labels: ['test', 'exterior'],
  description: 'Test upload'
});

console.log('Upload result:', result);
```

**Expected**: 
- ✅ File uploaded to Supabase Storage
- ✅ Record created in `media_assets` table
- ✅ Public URL returned

### Test 2: AI Image Analysis (2 minutes)

```javascript
// Test AI analysis
const { AI_SERVICE } = await import('/src/lib/ai-service.ts');

const analysis = await AI_SERVICE.analyzeImages(
  [], // empty for demo mode
  'Badkamer renovatie met nieuwe tegels',
  'Badkamer'
);

console.log('AI Analysis:', analysis);
```

**Expected**:
- ✅ Dimensions estimated
- ✅ Materials list generated
- ✅ Work types identified
- ✅ Price estimate provided

### Test 3: PDF Export (1 minute)

```javascript
// Test PDF export
const { exportQuotePDF } = await import('/src/lib/pdf-export.ts');

await exportQuotePDF({
  quoteNumber: 'TEST-001',
  date: new Date().toLocaleDateString('nl-NL'),
  validUntil: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('nl-NL'),
  customer: {
    name: 'Test Klant',
    address: 'Teststraat 1',
    postalCode: '1234 AB',
    city: 'Amsterdam'
  },
  company: {
    name: 'Archon Pro',
    address: 'Voorbeeldstraat 123',
    postalCode: '1234 AB',
    city: 'Amsterdam',
    phone: '+31 20 123 4567',
    email: 'info@archonpro.com'
  },
  items: [
    {
      description: 'Badkamer renovatie',
      quantity: 1,
      unit: 'stuk',
      unitPrice: 2500,
      totalPrice: 2500
    }
  ],
  subtotal: 2500,
  vatRate: 21,
  vatAmount: 525,
  total: 3025
});
```

**Expected**:
- ✅ PDF downloaded automatically
- ✅ Professional layout with branding
- ✅ All data correctly formatted

### Test 4: AI Offerte Generator (3 minutes)

1. Navigate to `/offertes`
2. Click "Nieuwe offerte" button
3. Click "Start met AI" (hologram button)
4. Fill in:
   - Klant: "Test Klant"
   - Project: "Badkamer Renovatie"
5. Click "Volgende"
6. Add description: "Volledige badkamer renovatie met nieuwe tegels en sanitair"
7. Click "Volgende"
8. (Optional) Upload test images
9. Click "Start Analyse"
10. Wait for AI analysis
11. Chat with AI: "Bereken de prijzen"
12. Review pricing
13. Click "Offerte Voltooien"
14. Click "PDF" button to export

**Expected**:
- ✅ Smooth wizard flow
- ✅ AI analysis completes
- ✅ Pricing calculated
- ✅ PDF exports successfully

### Test 5: Complete Workflow (5 minutes)

```javascript
// Test complete wizard workflow
const { 
  createDraftSession, 
  completeWizard 
} = await import('/src/lib/api-field-to-invoice.ts');

// Create draft
const draft = await createDraftSession(1, {
  step1: {
    customerId: 'test-customer-id',
    newCustomer: {
      name: 'Test Klant',
      email: 'test@example.com'
    }
  },
  step2: {
    newSite: {
      address: 'Teststraat 1',
      postalCode: '1234 AB',
      city: 'Amsterdam'
    }
  },
  step5: {
    description: 'Test project beschrijving'
  },
  step6: {
    quoteLines: [
      {
        description: 'Test item',
        quantity: 1,
        unitPrice: 100,
        totalPrice: 100
      }
    ],
    totalAmount: 100
  }
});

console.log('Draft created:', draft);

// Complete workflow
const { quote, project } = await completeWizard(draft, true);

console.log('Quote:', quote);
console.log('Project:', project);
```

**Expected**:
- ✅ Draft session created
- ✅ Quote created with number
- ✅ Project auto-created
- ✅ Draft session cleaned up

## ✅ Success Criteria

All features working if:

- [ ] Media uploads to Supabase Storage
- [ ] AI analysis returns structured data
- [ ] PDF exports with professional layout
- [ ] Wizard completes full workflow
- [ ] No console errors
- [ ] Database records created correctly

## 🐛 Troubleshooting

### "Not authenticated" error
**Solution**: Make sure you're logged in to the app

### "Supabase URL not found"
**Solution**: Check `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### AI returns mock data
**Solution**: This is normal if `VITE_GEMINI_API_KEY` is not set. Add API key for real AI.

### PDF export fails
**Solution**: Check browser console for errors. Make sure jsPDF is installed.

### Storage upload fails
**Solution**: 
1. Check if storage bucket exists in Supabase
2. Verify RLS policies are created
3. Run `fix_migration.sql` if needed

## 📊 Verify in Supabase Dashboard

After testing, check these tables:

1. **Storage** → `field-to-invoice-media` bucket
   - Should have uploaded files

2. **Table Editor** → `media_assets`
   - Should have records with `storage_path` and `public_url`

3. **Table Editor** → `draft_sessions`
   - Should have draft records (or empty if completed)

4. **Table Editor** → `quotes`
   - Should have generated quotes

5. **Table Editor** → `projects`
   - Should have auto-created projects

## 🎉 All Tests Passed?

Congratulations! The field-to-invoice implementation is working correctly.

You can now:
- Upload photos from the field
- Get AI-powered analysis
- Generate professional quotes
- Export PDFs
- Create projects automatically

## 📞 Need Help?

Check these files for implementation details:
- `docs/FIELD_TO_INVOICE_IMPLEMENTATION.md` - Complete documentation
- `client/src/lib/media-service.ts` - Media upload code
- `client/src/lib/ai-service.ts` - AI integration code
- `client/src/lib/pdf-export.ts` - PDF generation code
- `client/src/lib/api-field-to-invoice.ts` - API integration code
