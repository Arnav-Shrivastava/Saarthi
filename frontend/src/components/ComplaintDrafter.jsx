import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { FileText, Copy, Printer, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ComplaintDrafter() {
  const [story, setStory] = useState('');
  const [language, setLanguage] = useState('English');
  const [recipient, setRecipient] = useState('Police Station');
  const [draft, setDraft] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  const handleDraft = async () => {
    if (!story.trim()) return;
    setIsDrafting(true);
    setDraft('');
    
    try {
      const response = await fetch('https://saarthi-production-7b58.up.railway.app/draft-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story, language, recipient }),
      });
      
      const data = await response.json();
      setDraft(data.draft || 'Failed to draft complaint.');
    } catch (error) {
      console.error(error);
      setDraft('An error occurred while drafting your complaint.');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<pre style="white-space: pre-wrap; font-family: sans-serif;">${draft}</pre>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-full flex flex-col pt-24">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
          <FileText className="w-10 h-10 text-primary" />
          Nyaya Saarthi (Legal Drafter)
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Tell us your problem naturally, and we'll format it into an official complaint/FIR.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card border-border/40 overflow-hidden relative">
          <CardHeader>
            <CardTitle>Describe Your Problem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div>
              <label className="text-sm font-medium mb-2 block">What happened?</label>
              <textarea 
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="E.g., My neighbor broke my fence and threatened me..."
                rows={8}
                className="w-full flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Marathi</option>
                  <option>Tamil</option>
                  <option>Telugu</option>
                  <option>Bengali</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Authority</label>
                <select 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option>Police Station</option>
                  <option>Sarpanch</option>
                  <option>District Magistrate</option>
                  <option>Bank Manager</option>
                </select>
              </div>
            </div>

            <Button onClick={handleDraft} disabled={isDrafting || !story.trim()} className="w-full mt-4">
              {isDrafting ? 'Drafting...' : 'Format Complaint'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Formal Draft</CardTitle>
            {draft && (
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleCopy} title="Copy">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handlePrint} title="Print">
                  <Printer className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {draft ? (
              <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                <ReactMarkdown>{draft}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-lg">
                Your draft will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}