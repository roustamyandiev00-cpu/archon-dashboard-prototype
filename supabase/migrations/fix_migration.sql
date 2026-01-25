-- Fix voor gedeeltelijk toegepaste migratie
-- Run dit in Supabase SQL Editor

-- Verwijder de foutieve policy als die bestaat
DROP POLICY IF EXISTS "Users can manageown draft_sessions" ON draft_sessions;
DROP POLICY IF EXISTS "Users can manage own draft_sessions" ON draft_sessions;
DROP POLICY IF EXISTS "Users can manage own invoice_lines" ON invoice_lines;

-- Maak de correcte policies aan (zonder IF NOT EXISTS)
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

-- Maak de triggers aan
DROP TRIGGER IF EXISTS update_draft_sessions_updated_at ON draft_sessions;
CREATE TRIGGER update_draft_sessions_updated_at 
BEFORE UPDATE ON draft_sessions 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_lines_updated_at ON invoice_lines;
CREATE TRIGGER update_invoice_lines_updated_at 
BEFORE UPDATE ON invoice_lines 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
