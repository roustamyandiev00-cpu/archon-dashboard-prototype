/**
 * Step 1: Customer Selection
 * Search, select, or create customer
 */

import { useState } from "react";
import { Search, Plus, User, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useWizardDraft } from "../WizardContainer";
import type { Site } from "@/types/field-to-invoice";

// Mock customer data - in real app, this would come from API
const MOCK_CUSTOMERS = [
  { id: "1", naam: "Jansen B.V.", email: "jansen@voorbeeld.nl", type: "zakelijk", bedrijf: "Jansen Bouw", btwNummer: "NL123456789B01", adres: "Hoofdstraat 1, 1234 AB, Amsterdam", postcode: "1234 AB", plaats: "Amsterdam" },
  { id: "2", naam: "De Vries", email: "devries@voorbeeld.nl", type: "particulier", telefoon: "06-12345678", adres: "Kerkstraat 5, 5678 CD, Utrecht", postcode: "5678 CD", plaats: "Utrecht" },
  { id: "3", naam: "Bakkerij Van der Berg", email: "bakker@voorbeeld.nl", type: "zakelijk", bedrijf: "Van der Berg B.V.", btwNummer: "NL987654321B01", adres: "Industrieweg 12, 3012 GD, Rotterdam", postcode: "3012 GD", plaats: "Rotterdam" },
];

export function Step1Customer() {
  const { draft, updateDraft, markDirty } = useWizardDraft('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<typeof MOCK_CUSTOMERS[0] | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    naam: '',
    email: '',
    telefoon: '',
    adres: '',
    postcode: '',
    plaats: '',
    land: 'Nederland',
    bedrijf: '',
    kvkNummer: '',
    btwNummer: '',
    contactpersoon: '',
    notities: '',
    type: 'particulier' as 'particulier' | 'zakelijk',
  });

  const filteredCustomers = MOCK_CUSTOMERS.filter(c =>
    c.naam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.bedrijf?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCustomer = (customer: typeof MOCK_CUSTOMERS[0]) => {
    setSelectedCustomer(customer);
    updateDraft({ klant: customer });
    markDirty();
  };

  const handleCreateCustomer = () => {
    // In real app, this would call API to create customer
    const newCustomer = {
      id: 'new',
      ...formData,
    };
    setSelectedCustomer(newCustomer);
    updateDraft({ klant: newCustomer });
    markDirty();
    setShowCreateForm(false);
    setFormData({
      naam: '',
      email: '',
      telefoon: '',
      adres: '',
      postcode: '',
      plaats: '',
      land: 'Nederland',
      bedrijf: '',
      kvkNummer: '',
      btwNummer: '',
      contactpersoon: '',
      notities: '',
      type: 'particulier',
    });
  };

  const validateForm = () => {
    return formData.naam.length > 0 && formData.email.length > 0;
  };

  return (
    <Card className="bg-[#0F1520] border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <User className="w-5 h-5 text-cyan-400" />
          Klant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 w-5 h-5 text-zinc-500" />
          <Input
            placeholder="Zoek klant op naam, email of bedrijf..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Customer List */}
        {filteredCustomers.length > 0 && !showCreateForm && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => handleSelectCustomer(customer)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border border-white/10 transition-colors",
                  selectedCustomer?.id === customer.id
                    ? "bg-cyan-500/20 border-cyan-500/50"
                    : "bg-white/5 hover:bg-white/10"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    {customer.type === 'zakelijk' ? (
                      <Building2 className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <User className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{customer.naam}</p>
                      {customer.type === 'zakelijk' && (
                        <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                          Zakelijk
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-zinc-400 space-y-1">
                      {customer.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                      {customer.telefoon && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{customer.telefoon}</span>
                        </div>
                      )}
                      {customer.bedrijf && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>{customer.bedrijf}</span>
                        </div>
                      )}
                      {customer.btwNummer && (
                        <div className="text-xs text-zinc-500">
                          BTW: {customer.btwNummer}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Create New Customer Button */}
        {!showCreateForm && (
          <Button
            variant="outline"
            onClick={() => setShowCreateForm(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe klant toevoegen
          </Button>
        )}

        {/* Create Customer Form */}
        {showCreateForm && (
          <div className="space-y-4 border-t border-white/10 pt-4">
            <h3 className="text-base font-semibold text-white mb-4">Nieuwe klant</h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="naam">Naam *</Label>
                <Input
                  id="naam"
                  value={formData.naam}
                  onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
                  placeholder="Volledige naam"
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="naam@voorbeeld.nl"
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'particulier' | 'zakelijk' })}
                  className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg px-3 py-2 text-white"
                >
                  <option value="particulier">Particulier</option>
                  <option value="zakelijk">Zakelijk</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="telefoon">Telefoon</Label>
                  <Input
                    id="telefoon"
                    type="tel"
                    value={formData.telefoon}
                    onChange={(e) => setFormData({ ...formData, telefoon: e.target.value })}
                    placeholder="06-12345678"
                  />
                </div>
                <div>
                  <Label htmlFor="adres">Adres</Label>
                  <Input
                    id="adres"
                    value={formData.adres}
                    onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                    placeholder="Straat + huisnummer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    placeholder="1234 AB"
                  />
                </div>
                <div>
                  <Label htmlFor="plaats">Plaats</Label>
                  <Input
                    id="plaats"
                    value={formData.plaats}
                    onChange={(e) => setFormData({ ...formData, plaats: e.target.value })}
                    placeholder="Amsterdam"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bedrijf">Bedrijf</Label>
                <Input
                  id="bedrijf"
                  value={formData.bedrijf}
                  onChange={(e) => setFormData({ ...formData, bedrijf: e.target.value })}
                  placeholder="Naam B.V."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="kvkNummer">KvK-nummer</Label>
                  <Input
                    id="kvkNummer"
                    value={formData.kvkNummer}
                    onChange={(e) => setFormData({ ...formData, kvkNummer: e.target.value })}
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <Label htmlFor="btwNummer">BTW-nummer</Label>
                  <Input
                    id="btwNummer"
                    value={formData.btwNummer}
                    onChange={(e) => setFormData({ ...formData, btwNummer: e.target.value })}
                    placeholder="NL123456789B01"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contactpersoon">Contactpersoon</Label>
                <Input
                  id="contactpersoon"
                  value={formData.contactpersoon}
                  onChange={(e) => setFormData({ ...formData, contactpersoon: e.target.value })}
                  placeholder="Naam contactpersoon"
                />
              </div>

              <div>
                <Label htmlFor="notities">Notities</Label>
                <textarea
                  id="notities"
                  value={formData.notities}
                  onChange={(e) => setFormData({ ...formData, notities: e.target.value })}
                  placeholder="Extra informatie..."
                  rows={3}
                  className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg px-3 py-2 text-white resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="flex-1"
              >
                Annuleren
              </Button>
              <Button
                onClick={handleCreateCustomer}
                disabled={!validateForm()}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                Opslaan klant
              </Button>
            </div>
          </div>
        )}

        {/* Validation Message */}
        {selectedCustomer && (
          <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="font-medium text-white">{selectedCustomer.naam}</p>
                <p className="text-sm text-zinc-300">
                  {selectedCustomer.type === 'zakelijk' ? selectedCustomer.bedrijf : 'Particulier'}
                  {selectedCustomer.email && ` • ${selectedCustomer.email}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
