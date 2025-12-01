import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Select, TextArea } from './UI';
import { ExpenseReport, ExpenseLineItem, ExpenseStatus } from '../types';
import { Plus, Trash2, ArrowLeft, Save, Sparkles, CheckCircle2, AlertTriangle, Upload, FileText, ScanLine, Settings, ShieldCheck } from 'lucide-react';
import { checkPolicyCompliance, parseReceipt, extractPolicyRules } from '../services/geminiService';

const MILEAGE_RATE = 0.545;

export const CreateReportWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [report, setReport] = useState<Partial<ExpenseReport>>({
    company: 'Avo.ai',
    date: new Date().toISOString().split('T')[0],
    status: ExpenseStatus.DRAFT,
    lineItems: []
  });

  const [currentLine, setCurrentLine] = useState<Partial<ExpenseLineItem>>({
    date: new Date().toISOString().split('T')[0],
    quantity: 0,
    amount: 0,
    receiptAttached: false
  });
  
  // Policy State
  const [activePolicyRules, setActivePolicyRules] = useState<string | undefined>(undefined);
  const [isUploadingPolicy, setIsUploadingPolicy] = useState(false);
  const [policyFileName, setPolicyFileName] = useState<string>("");

  const [isEditingLine, setIsEditingLine] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [complianceCheckLoading, setComplianceCheckLoading] = useState(false);
  const [complianceResult, setComplianceResult] = useState<{message: string, type: 'success' | 'warning'} | null>(null);
  
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const quickReceiptInputRef = useRef<HTMLInputElement>(null);
  const policyInputRef = useRef<HTMLInputElement>(null);

  // --- Step 1: Header Handlers ---
  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReport(prev => ({ ...prev, [name]: value }));
  };

  const submitHeader = (e: React.FormEvent) => {
    e.preventDefault();
    if (!report.businessPurpose || !report.reimbursementType || !report.company) return; // Basic validation
    setStep(2);
  };

  // --- File Handlers ---
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningReceipt(true);
    // Reset editing state if we are initiating from the main list
    if (!isEditingLine) {
        setEditingIndex(-1);
        setCurrentLine({
            date: new Date().toISOString().split('T')[0],
            quantity: 0,
            amount: 0,
            receiptAttached: false,
            expenseItem: '',
            memo: '',
            businessReason: '',
            costCenter: '',
            fund: ''
        });
    }

    const data = await parseReceipt(file);
    setIsScanningReceipt(false);

    if (data) {
        setCurrentLine(prev => ({
            ...prev,
            ...data,
            receiptAttached: true // Auto-check if they uploaded one
        }));
        setComplianceResult({ message: "Receipt data auto-filled! Please review.", type: 'success' });
        // Force open editor
        setIsEditingLine(true);
    } else {
        alert("Could not extract data from receipt. Please try again or enter manually.");
    }
  };

  const handlePolicyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingPolicy(true);
      const rules = await extractPolicyRules(file);
      setIsUploadingPolicy(false);

      if (rules) {
          setActivePolicyRules(rules);
          setPolicyFileName(file.name);
          // Clear any previous compliance checks as rules changed
          setComplianceResult({ message: "Policy updated. New expenses will be analyzed against this file.", type: 'success' });
      } else {
          alert("Failed to read policy file.");
      }
  };

  // --- Step 2: Line Item Handlers ---
  const handleLineChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let newVal: any = value;
    if (type === 'number') newVal = parseFloat(value) || 0;
    
    setCurrentLine(prev => {
        const updated = { ...prev, [name]: newVal };
        
        // Auto-calc mileage
        if (updated.expenseItem === 'Mileage' && (name === 'quantity' || name === 'expenseItem')) {
            updated.amount = (updated.quantity || 0) * MILEAGE_RATE;
        }
        
        return updated;
    });
    setComplianceResult(null); // Reset AI check on change
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setCurrentLine(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleComplianceCheck = async () => {
    if (!currentLine.amount || !currentLine.expenseItem) return;
    
    setComplianceCheckLoading(true);
    setComplianceResult(null);
    
    // Pass the custom policy rules if they exist
    const warning = await checkPolicyCompliance(currentLine, activePolicyRules);
    setComplianceCheckLoading(false);

    if (warning) {
        setComplianceResult({ message: warning, type: 'warning' });
    } else {
        setComplianceResult({ message: "Item appears compliant with active policy.", type: 'success' });
    }
  };

  const saveLineItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fallback manual check if AI check wasn't run, but still good to have basic logic
    // We only enforce strict receipt rule if using default policy, as custom policy might differ
    if (!activePolicyRules && (currentLine.amount || 0) > 75 && !currentLine.receiptAttached) {
        alert("Standard Policy Violation: Receipt is required for expenses over $75.");
        return;
    }

    const newLine = { ...currentLine, id: Date.now().toString() } as ExpenseLineItem;
    
    setReport(prev => {
        const items = prev.lineItems ? [...prev.lineItems] : [];
        if (editingIndex >= 0) {
            items[editingIndex] = newLine;
        } else {
            items.push(newLine);
        }
        // Update Total
        const total = items.reduce((sum, item) => sum + item.amount, 0);
        return { ...prev, lineItems: items, total };
    });

    // Reset
    setCurrentLine({
        date: new Date().toISOString().split('T')[0],
        quantity: 0,
        amount: 0,
        receiptAttached: false,
        expenseItem: '',
        memo: '',
        businessReason: '',
        costCenter: '',
        fund: ''
    });
    setIsEditingLine(false);
    setEditingIndex(-1);
    setComplianceResult(null);
  };

  const deleteLine = (index: number) => {
    setReport(prev => {
        const items = prev.lineItems ? [...prev.lineItems] : [];
        items.splice(index, 1);
        const total = items.reduce((sum, item) => sum + item.amount, 0);
        return { ...prev, lineItems: items, total };
    });
  };

  const editLine = (index: number) => {
    if (!report.lineItems) return;
    setCurrentLine(report.lineItems[index]);
    setEditingIndex(index);
    setIsEditingLine(true);
  };

  const finalizeReport = () => {
    alert("Report Submitted Successfully!");
    navigate('/expenses');
  };

  // --- Renderers ---

  if (step === 1) {
    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-light text-gray-800 mb-6">Create Expense Report</h1>
            <Card className="p-8">
                <form onSubmit={submitHeader}>
                    <h2 className="text-lg font-medium text-gray-800 mb-6 border-b pb-2">Header Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="Company" 
                            name="company" 
                            value={report.company} 
                            disabled 
                            required 
                            className="bg-gray-100"
                        />
                         <Select 
                            label="Reimbursement Type" 
                            name="reimbursementType"
                            value={report.reimbursementType}
                            onChange={handleHeaderChange}
                            required
                            options={['Direct Deposit', 'Check', 'Wire Transfer']}
                        />
                        <Input 
                            label="Date" 
                            type="date" 
                            name="date"
                            value={report.date}
                            onChange={handleHeaderChange}
                            required 
                        />
                        <Input 
                            label="Cost Center Region" 
                            name="region"
                            placeholder="e.g., US-East"
                        />
                        <div className="md:col-span-2">
                             <Input 
                                label="Business Purpose" 
                                name="businessPurpose"
                                value={report.businessPurpose}
                                onChange={handleHeaderChange}
                                required 
                                placeholder="e.g., Client Visit Q4"
                            />
                        </div>
                        <div className="md:col-span-2">
                             <TextArea 
                                label="Memo" 
                                name="memo"
                                value={report.memo}
                                onChange={handleHeaderChange}
                                placeholder="Additional details..."
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => navigate('/expenses')}>Cancel</Button>
                        <Button type="submit">Continue to Lines</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6">
         {/* Summary Header */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-40">
            <div>
                <h2 className="text-lg font-bold text-gray-800">{report.businessPurpose || 'New Report'}</h2>
                <div className="text-sm text-gray-500 flex gap-4 mt-1">
                    <span>{report.company}</span>
                    <span>•</span>
                    <span>{report.date}</span>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                 {/* Policy Uploader Badge */}
                 <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <div className={`p-1.5 rounded-full ${activePolicyRules ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                        <ShieldCheck size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-1">Active Policy (审批标准)</span>
                        <span className="text-xs font-semibold text-gray-700 leading-none truncate max-w-[120px]">
                            {activePolicyRules ? policyFileName : 'Standard Avo.ai'}
                        </span>
                    </div>
                    <div className="h-6 w-px bg-gray-300 mx-1"></div>
                    <input 
                        type="file" 
                        ref={policyInputRef} 
                        className="hidden" 
                        onChange={handlePolicyUpload}
                        accept=".pdf,.png,.jpg,.jpeg,.txt"
                    />
                    <button 
                        onClick={() => policyInputRef.current?.click()}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide disabled:opacity-50"
                        disabled={isUploadingPolicy}
                    >
                        {isUploadingPolicy ? 'Loading...' : 'Upload'}
                    </button>
                 </div>

                <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                    <div className="text-right">
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wide">Total Amount</div>
                        <div className="text-2xl font-bold text-[#005cb9]">${(report.total || 0).toFixed(2)}</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Line Item List */}
            <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-700">Expense Lines</h3>
                </div>

                {!isEditingLine && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                         <div className="relative">
                            <input 
                                type="file" 
                                ref={quickReceiptInputRef} 
                                className="hidden" 
                                onChange={handleReceiptUpload}
                                accept="image/*,.pdf"
                            />
                            <Button 
                                onClick={() => quickReceiptInputRef.current?.click()}
                                isLoading={isScanningReceipt}
                                className="w-full text-xs py-1 h-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center justify-center gap-1.5"
                            >
                                <ScanLine size={14} /> Scan Receipt
                            </Button>
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setCurrentLine({
                                    date: new Date().toISOString().split('T')[0],
                                    quantity: 0,
                                    amount: 0,
                                    receiptAttached: false,
                                    expenseItem: '',
                                    memo: '',
                                    businessReason: '',
                                    costCenter: '',
                                    fund: ''
                                });
                                setEditingIndex(-1);
                                setIsEditingLine(true);
                                setComplianceResult(null);
                            }} 
                            className="w-full text-xs py-1 h-9"
                        >
                            <Plus size={14} /> Manual Add
                        </Button>
                    </div>
                )}
                
                <div className="space-y-3">
                    {report.lineItems?.length === 0 && !isEditingLine && (
                         <div className="text-center p-8 bg-gray-50 rounded border border-dashed border-gray-300 text-gray-400 text-sm">
                            No lines added yet.<br/>Scan a receipt to start.
                         </div>
                    )}
                    {report.lineItems?.map((item, idx) => (
                        <div 
                            key={idx} 
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${editingIndex === idx && isEditingLine ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                            onClick={() => editLine(idx)}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-gray-800 text-sm">{item.expenseItem}</span>
                                <span className="font-bold text-gray-800">${item.amount.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{item.memo}</p>
                            <div className="mt-2 flex justify-end">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteLine(idx); }}
                                    className="text-red-500 hover:text-red-700 p-1"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {report.lineItems && report.lineItems.length > 0 && !isEditingLine && (
                    <Button onClick={finalizeReport} className="w-full mt-6">Submit Report</Button>
                )}
            </div>

            {/* Right: Line Item Editor */}
            <div className="lg:col-span-2">
                {isEditingLine ? (
                    <Card className="p-6 relative">
                         <div className="absolute top-4 right-4">
                            <button onClick={() => setIsEditingLine(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                         </div>
                        
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                                {editingIndex >= 0 ? 'Edit Line Item' : 'New Line Item'}
                            </h3>
                        </div>

                        {/* Prominent Receipt Auto-Fill Section - Also available inside editor for edits */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <ScanLine size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800">Auto-fill with Receipt (文件自动填写)</h4>
                                    <p className="text-xs text-gray-600 mt-1 max-w-sm">
                                        Upload an image or PDF. Gemini will extract the date, amount, merchant, and category for you.
                                    </p>
                                </div>
                            </div>
                            <div>
                                <input 
                                    type="file" 
                                    ref={receiptInputRef} 
                                    className="hidden" 
                                    onChange={handleReceiptUpload}
                                    accept="image/*,.pdf"
                                />
                                <Button 
                                    onClick={() => receiptInputRef.current?.click()}
                                    isLoading={isScanningReceipt}
                                    className="bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 shadow-sm"
                                >
                                    <Upload size={14} /> {isScanningReceipt ? 'Scanning...' : 'Upload Receipt'}
                                </Button>
                            </div>
                        </div>
                        
                        <form onSubmit={saveLineItem}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                <Input 
                                    label="Date" 
                                    type="date" 
                                    name="date"
                                    value={currentLine.date}
                                    onChange={handleLineChange}
                                    required 
                                />
                                <Select 
                                    label="Expense Item" 
                                    name="expenseItem"
                                    value={currentLine.expenseItem}
                                    onChange={handleLineChange}
                                    required
                                    options={['Meals', 'Travel', 'Lodging', 'Mileage', 'Office Supplies', 'Entertainment', 'Medical', 'Other']}
                                />
                                
                                {currentLine.expenseItem === 'Mileage' ? (
                                    <>
                                        <Input 
                                            label="Distance (Miles)" 
                                            type="number" 
                                            name="quantity"
                                            value={currentLine.quantity}
                                            onChange={handleLineChange}
                                            required 
                                        />
                                        <div className="flex flex-col gap-1 mb-4">
                                            <label className="text-sm font-medium text-gray-700">Total Amount</label>
                                            <div className="bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700">
                                                ${(currentLine.amount || 0).toFixed(2)} <span className="text-xs text-gray-400 ml-2">(@ $0.545/mi)</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="md:col-span-2">
                                        <Input 
                                            label="Amount" 
                                            type="number" 
                                            step="0.01"
                                            name="amount"
                                            value={currentLine.amount}
                                            onChange={handleLineChange}
                                            required 
                                        />
                                    </div>
                                )}
                                
                                <div className="md:col-span-2">
                                    <TextArea 
                                        label="Memo" 
                                        name="memo"
                                        value={currentLine.memo}
                                        onChange={handleLineChange}
                                        required
                                        placeholder="Description of the expense..."
                                    />
                                </div>

                                {/* Smart Policy Check Button */}
                                <div className="md:col-span-2 mb-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-gray-700">Policy Validation (审批标准分析)</label>
                                        <div className="flex items-center gap-3">
                                             <Button 
                                                type="button" 
                                                variant="secondary" 
                                                onClick={handleComplianceCheck}
                                                isLoading={complianceCheckLoading}
                                                disabled={!currentLine.amount || !currentLine.expenseItem || !currentLine.memo}
                                                className="text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
                                            >
                                                <Sparkles size={16} /> Analyze Risk
                                            </Button>
                                            
                                            {complianceResult && (
                                                <div className={`flex-1 text-sm p-2 rounded flex items-center gap-2 ${complianceResult.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                                                    {complianceResult.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                                                    {complianceResult.message}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            Validating against: {activePolicyRules ? `Custom Policy (${policyFileName})` : 'Standard Avo.ai Policy'}
                                        </p>
                                    </div>
                                </div>

                                <div className="col-span-full border-t border-gray-100 my-2"></div>
                                <h4 className="col-span-full text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Allocation & Details</h4>

                                <Input 
                                    label="Cost Center" 
                                    name="costCenter"
                                    value={currentLine.costCenter}
                                    onChange={handleLineChange}
                                    required 
                                    placeholder="CC-XXXX"
                                />
                                <Input 
                                    label="Fund" 
                                    name="fund"
                                    value={currentLine.fund}
                                    onChange={handleLineChange}
                                    required 
                                    placeholder="FD-XXXX"
                                />
                                <Input 
                                    label="Additional Worktags" 
                                    name="additionalWorktags"
                                    value={currentLine.additionalWorktags}
                                    onChange={handleLineChange}
                                    placeholder="Project, Region, etc."
                                />
                                <Input 
                                    label="Business Reason" 
                                    name="businessReason"
                                    value={currentLine.businessReason}
                                    onChange={handleLineChange}
                                    required 
                                    placeholder="Justification for expense"
                                />

                                <div className="col-span-full mt-4 flex items-center gap-2">
                                     <input 
                                        type="checkbox" 
                                        id="receiptAttached" 
                                        name="receiptAttached"
                                        checked={currentLine.receiptAttached}
                                        onChange={handleCheckboxChange}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                     />
                                     <label htmlFor="receiptAttached" className="text-sm font-medium text-gray-700">Receipt Attached</label>
                                     {/* Conditional warning only if using default policy */}
                                     {!activePolicyRules && (currentLine.amount || 0) > 75 && !currentLine.receiptAttached && (
                                         <span className="text-xs text-red-500 font-medium ml-2 animate-pulse">
                                            Required for amounts &gt; $75
                                         </span>
                                     )}
                                </div>
                            </div>
                            
                            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
                                <Button variant="secondary" onClick={() => setIsEditingLine(false)}>Cancel</Button>
                                <Button type="submit">Save Line Item</Button>
                            </div>
                        </form>
                    </Card>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Plus size={32} className="text-gray-300" />
                        </div>
                        <p>Select a line item to edit or create a new one.</p>
                        <p className="text-xs mt-2 text-gray-300">Tip: Upload a receipt to auto-fill details</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};