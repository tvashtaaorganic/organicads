'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, RefreshCcw, FileJson2 } from 'lucide-react';


// Define baseFields at the top
const baseFields = {
  Event: [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'imageUrl', label: 'Image URL', type: 'text' },
    { name: 'startDate', label: 'Start Date', type: 'text' },
    { name: 'startTime', label: 'Start Time', type: 'text' },
    { name: 'endDate', label: 'End Date', type: 'text' },
    { name: 'endTime', label: 'End Time', type: 'text' },
    { name: 'performerType', label: 'Performer Type', type: 'text' },
    { name: 'venueName', label: 'Venue Name', type: 'text' },
    { name: 'street', label: 'Street', type: 'text' },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'zipCode', label: 'Zip Code', type: 'text' },
    { name: 'countryCode', label: 'Country Code', type: 'text' },
    { name: 'regionCode', label: 'Region Code', type: 'text' },
    { name: 'currencyCode', label: 'Currency Code', type: 'text' },
  ],
  Article: [
    { name: 'headline', label: 'Article Headline', type: 'text', maxLength: 110 },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'imageUrl', label: 'Image URL', type: 'text' },
    { name: 'imageWidth', label: 'Image Width', type: 'text' },
    { name: 'imageHeight', label: 'Image Height', type: 'text' },
    { name: 'authorName', label: 'Author Name', type: 'text' },
    { name: 'publisherName', label: 'Publisher Name', type: 'text' },
    { name: 'publisherLogoUrl', label: 'Publisher Logo URL', type: 'text' },
    { name: 'publisherLogoWidth', label: 'Publisher Logo Width', type: 'text' },
    { name: 'publisherLogoHeight', label: 'Publisher Logo Height', type: 'text' },
    { name: 'datePublished', label: 'Date Published', type: 'text' },
    { name: 'dateModified', label: 'Date Modified', type: 'text' },
  ],
  Organization: [
    { name: 'organizationType', label: 'Organization Type', type: 'text' },
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'alternateName', label: 'Alternate Name', type: 'text' },
    { name: 'url', label: 'URL', type: 'text' },
    { name: 'logoUrl', label: 'Logo URL', type: 'text' },
  ],
  LocalBusiness: [
    { name: 'name', label: 'Business Name', type: 'text' },
    { name: 'addressLocality', label: 'City', type: 'text' },
    { name: 'addressRegion', label: 'State', type: 'text' },
    { name: 'postalCode', label: 'Postal Code', type: 'text' },
    { name: 'telephone', label: 'Phone Number', type: 'text' },
  ]
}

export default function SchemaGenerator() {
  const [schemaType, setSchemaType] = useState('LocalBusiness')
  const [schemaData, setSchemaData] = useState({
    Event: {
      name: '',
      description: '',
      imageUrl: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      performerType: '',
      venueName: '',
      street: '',
      city: '',
      zipCode: '',
      countryCode: '',
      regionCode: '',
      currencyCode: '',
      tickets: [{ name: '', url: '', price: '', availability: '' }]
    },
    Article: {
      headline: '',
      description: '',
      imageUrl: '',
      imageWidth: '',
      imageHeight: '',
      authorName: '',
      publisherName: '',
      publisherLogoUrl: '',
      publisherLogoWidth: '',
      publisherLogoHeight: '',
      datePublished: '',
      dateModified: ''
    },
    Organization: {
      organizationType: '',
      name: '',
      alternateName: '',
      url: '',
      logoUrl: '',
      socialProfiles: [{ url: '' }],
      contacts: [{ type: '', areaServed: ['IN'], phone: '', email: '', languages: ['en'] }]
    },
    LocalBusiness: {
      name: '',
      addressLocality: '',
      addressRegion: '',
      postalCode: '',
      telephone: ''
    }
  }[schemaType])

  const [generatedSchema, setGeneratedSchema] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [customFields, setCustomFields] = useState([{ key: '', value: '' }])

  // Sync schemaData when schemaType changes
  useEffect(() => {
    setSchemaData(prev => ({
      ...prev,
      ...baseFields[schemaType].reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}),
      ...(schemaType === 'Event' ? { tickets: [{ name: '', url: '', price: '', availability: '' }] } : {}),
      ...(schemaType === 'Organization' ? { 
        socialProfiles: [{ url: '' }], 
        contacts: [{ type: '', areaServed: ['IN'], phone: '', email: '', languages: ['en'] }] 
      } : {})
    }))
  }, [schemaType])

  const handleInputChange = (field: string, value: string) => {
    setSchemaData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialProfileChange = (index: number, value: string) => {
    const updatedProfiles = [...(schemaData.socialProfiles || [{ url: '' }])]
    updatedProfiles[index].url = value
    setSchemaData(prev => ({
      ...prev,
      socialProfiles: updatedProfiles
    }))
  }

  const addSocialProfile = () => {
    setSchemaData(prev => ({
      ...prev,
      socialProfiles: [...(prev.socialProfiles || []), { url: '' }]
    }))
  }

  const removeSocialProfile = (index: number) => {
    const updatedProfiles = (schemaData.socialProfiles || []).filter((_, i) => i !== index)
    setSchemaData(prev => ({
      ...prev,
      socialProfiles: updatedProfiles.length ? updatedProfiles : [{ url: '' }]
    }))
  }

  const handleContactChange = (index: number, field: string, value: string | string[]) => {
    const updatedContacts = [...(schemaData.contacts || [{ type: '', areaServed: ['IN'], phone: '', email: '', languages: ['en'] }])]
    updatedContacts[index][field] = value
    setSchemaData(prev => ({
      ...prev,
      contacts: updatedContacts
    }))
  }

  const addContact = () => {
    setSchemaData(prev => ({
      ...prev,
      contacts: [...(prev.contacts || []), { type: '', areaServed: ['IN'], phone: '', email: '', languages: ['en'] }]
    }))
  }

  const removeContact = (index: number) => {
    const updatedContacts = (schemaData.contacts || []).filter((_, i) => i !== index)
    setSchemaData(prev => ({
      ...prev,
      contacts: updatedContacts.length ? updatedContacts : [{ type: '', areaServed: ['IN'], phone: '', email: '', languages: ['en'] }]
    }))
  }

  const handleCustomFieldChange = (index: number, field: string, value: string) => {
    const updatedFields = [...customFields]
    updatedFields[index][field] = value
    setCustomFields(updatedFields)
  }

  const addCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }])
  }

  const removeCustomField = (index: number) => {
    const updatedFields = customFields.filter((_, i) => i !== index)
    setCustomFields(updatedFields)
  }

  const generateSchema = () => {
    let schema = {
      '@context': 'https://schema.org',
      '@type': schemaType
    }

    switch (schemaType) {
      case 'Event':
        schema = {
          ...schema,
          name: schemaData.name || '',
          description: schemaData.description || '',
          image: schemaData.imageUrl ? { '@type': 'ImageObject', url: schemaData.imageUrl } : undefined,
          startDate: schemaData.startDate ? `${schemaData.startDate}T${schemaData.startTime || '00:00'}` : '',
          endDate: schemaData.endDate ? `${schemaData.endDate}T${schemaData.endTime || '00:00'}` : '',
          location: {
            '@type': 'Place',
            name: schemaData.venueName || '',
            address: {
              '@type': 'PostalAddress',
              streetAddress: schemaData.street || '',
              addressLocality: schemaData.city || '',
              postalCode: schemaData.zipCode || '',
              addressCountry: schemaData.countryCode || '',
              addressRegion: schemaData.regionCode || ''
            }
          },
          performer: { '@type': schemaData.performerType || 'Person', name: schemaData.venueName || '' },
          offers: (schemaData.tickets || []).map(ticket => ({
            '@type': 'Offer',
            name: ticket.name || '',
            url: ticket.url || '',
            price: ticket.price || '',
            priceCurrency: schemaData.currencyCode || 'USD',
            availability: ticket.availability || 'https://schema.org/InStock'
          }))
        }
        break
      case 'Article':
        schema = {
          ...schema,
          headline: schemaData.headline || '',
          description: schemaData.description || '',
          image: schemaData.imageUrl
            ? {
                '@type': 'ImageObject',
                url: schemaData.imageUrl,
                width: schemaData.imageWidth || '',
                height: schemaData.imageHeight || ''
              }
            : undefined,
          author: {
            '@type': 'Person',
            name: schemaData.authorName || ''
          },
          publisher: {
            '@type': 'Organization',
            name: schemaData.publisherName || '',
            logo: schemaData.publisherLogoUrl
              ? {
                  '@type': 'ImageObject',
                  url: schemaData.publisherLogoUrl, // Fixed syntax error here
                  width: schemaData.publisherLogoWidth || '',
                  height: schemaData.publisherLogoHeight || ''
                }
              : undefined
          },
          datePublished: schemaData.datePublished || '',
          dateModified: schemaData.dateModified || ''
        }
        break
      case 'Organization':
        schema = {
          ...schema,
          organizationType: schemaData.organizationType || '',
          name: schemaData.name || '',
          alternateName: schemaData.alternateName || '',
          url: schemaData.url || '',
          logo: schemaData.logoUrl ? { '@type': 'ImageObject', url: schemaData.logoUrl } : undefined,
          sameAs: (schemaData.socialProfiles || []).map(profile => profile.url).filter(Boolean),
          contactPoint: (schemaData.contacts || []).map(contact => ({
            '@type': 'ContactPoint',
            contactType: contact.type || 'None',
            areaServed: contact.areaServed || ['IN'],
            telephone: contact.phone || '',
            email: contact.email || '',
            availableLanguage: contact.languages || ['en']
          }))
        }
        break
      case 'LocalBusiness':
        schema = {
          ...schema,
          name: schemaData.name || '',
          address: {
            '@type': 'PostalAddress',
            addressLocality: schemaData.addressLocality || '',
            addressRegion: schemaData.addressRegion || '',
            postalCode: schemaData.postalCode || ''
          },
          telephone: schemaData.telephone || ''
        }
        break
    }

    // Add custom fields
    customFields.forEach(field => {
      if (field.key && field.value) {
        schema[field.key] = field.value
      }
    })

    // Filter out undefined properties
    schema = Object.fromEntries(
      Object.entries(schema).filter(([_, v]) => v !== undefined)
    )

    setGeneratedSchema(JSON.stringify(schema, null, 2))
  }

  const resetForm = () => {
    setSchemaData({
      ...schemaData,
      ...baseFields[schemaType].reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}),
      ...(schemaType === 'Event' ? { tickets: [{ name: '', url: '', price: '', availability: '' }] } : {}),
      ...(schemaType === 'Organization' ? { socialProfiles: [{ url: '' }], contacts: [{ type: '', areaServed: ['IN'], phone: '', email: '', languages: ['en'] }] } : {})
    })
    setCustomFields([{ key: '', value: '' }])
    setGeneratedSchema('')
    setCopyStatus('')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSchema)
    setCopyStatus('Copied to clipboard!')
    setTimeout(() => setCopyStatus(''), 2000)
  }

  const handleTicketChange = (index: number, field: string, value: string) => {
    const updatedTickets = [...(schemaData.tickets || [{ name: '', url: '', price: '', availability: '' }])]
    updatedTickets[index][field] = value
    setSchemaData(prev => ({
      ...prev,
      tickets: updatedTickets
    }))
  }

  const addTicket = () => {
    setSchemaData(prev => ({
      ...prev,
      tickets: [...(prev.tickets || []), { name: '', url: '', price: '', availability: '' }]
    }))
  }

  // Full countries list (shortened here, replace with your full list)
  const countries = [
    { value: 'US', label: 'United States of America (the)' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom of Great Britain and Northern Ireland (the)' },
    { value: 'IN', label: 'India' },
    { value: 'AU', label: 'Australia' },
    // Replace with your full list
  ]

  // Full languages list (shortened here, replace with your full list)
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'hi', label: 'Hindi' },
    { value: 'zh', label: 'Chinese' },
    // Replace with your full list
  ]

  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Left Side - Input Panel */}
      <div className="md:col-span-8 p-6 space-y-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-left">Schema Markup Generator</h1>
        <div className="space-y-2">
          <Label>Which Schema would you like to create?</Label>
          <Select
            value={schemaType}
            onValueChange={setSchemaType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select schema type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LocalBusiness">LocalBusiness</SelectItem>
              <SelectItem value="Article">Article</SelectItem>
              <SelectItem value="Event">Event</SelectItem>
              <SelectItem value="Organization">Organization</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {baseFields[schemaType].map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === 'text' ? (
                <Input
                  id={field.name}
                  value={schemaData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  maxLength={field.maxLength}
                />
              ) : (
                <Textarea
                  id={field.name}
                  value={schemaData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}

          {schemaType === 'Event' && (
            <div className="space-y-2">
              <Label>Tickets</Label>
              {(schemaData.tickets || []).map((ticket, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={ticket.name}
                    onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                    placeholder="Ticket Name"
                    className="flex-1"
                  />
                  <Input
                    value={ticket.url}
                    onChange={(e) => handleTicketChange(index, 'url', e.target.value)}
                    placeholder="Ticket URL"
                    className="flex-1"
                  />
                  <Input
                    value={ticket.price}
                    onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                    placeholder="Price"
                    className="flex-1"
                  />
                  <Input
                    value={ticket.availability}
                    onChange={(e) => handleTicketChange(index, 'availability', e.target.value)}
                    placeholder="Availability"
                    className="flex-1"
                  />
                </div>
              ))}
              <Button variant="outline" onClick={addTicket}>
                Add Ticket
              </Button>
            </div>
          )}

          {schemaType === 'Organization' && (
            <>
              {/* Social Profiles Section */}
              <div className="space-y-2">
                <Label>Social Profiles</Label>
                {(schemaData.socialProfiles || []).map((profile, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={profile.url}
                      onChange={(e) => handleSocialProfileChange(index, e.target.value)}
                      placeholder="URL"
                      className="flex-1"
                    />
                    <Button
                      variant="destructive"
                      onClick={() => removeSocialProfile(index)}
                      disabled={schemaData.socialProfiles.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addSocialProfile}>
                  + Add Profile
                </Button>
              </div>

              {/* Contacts Section */}
              <div className="space-y-2">
                <Label>Contacts</Label>
                {(schemaData.contacts || []).map((contact, index) => (
                  <div key={index} className="space-y-2 border p-4 rounded-md">
                    <div className="flex justify-between">
                      <h3>Contact {index + 1}</h3>
                      <Button
                        variant="destructive"
                        onClick={() => removeContact(index)}
                        disabled={schemaData.contacts.length === 1}
                      >
                        X
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Select
                        value={contact.type || 'None'}
                        onValueChange={(value) => handleContactChange(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Contact Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="customer service">Customer service</SelectItem>
                          <SelectItem value="technical support">Technical support</SelectItem>
                          <SelectItem value="billing support">Billing support</SelectItem>
                          <SelectItem value="bill payment">Bill payment</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="reservations">Reservations</SelectItem>
                          <SelectItem value="credit card support">Credit card support</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="baggage tracking">Baggage tracking</SelectItem>
                          <SelectItem value="roadside assistance">Roadside assistance</SelectItem>
                          <SelectItem value="package tracking">Package tracking</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="space-y-2">
                        <Label>Area</Label>
                        <ScrollArea className="h-[200px] border p-2 rounded-md">
                          {countries.map((country) => (
                            <div key={country.value} className="flex items-center space-x-2 py-1">
                              <input
                                type="checkbox"
                                checked={(contact.areaServed || ['IN']).includes(country.value)}
                                onChange={(e) => {
                                  const currentAreas = contact.areaServed || ['IN']
                                  const newAreas = e.target.checked
                                    ? [...currentAreas, country.value]
                                    : currentAreas.filter((area) => area !== country.value)
                                  handleContactChange(index, 'areaServed', newAreas)
                                }}
                              />
                              <span>{country.label}</span>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>

                      <Input
                        value={contact.phone || ''}
                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                        placeholder="Phone"
                      />
                      <Input
                        value={contact.email || ''}
                        onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                        placeholder="Email"
                      />

                      <div className="space-y-2">
                        <Label>Languages</Label>
                        <ScrollArea className="h-[200px] border p-2 rounded-md">
                          {languages.map((lang) => (
                            <div key={lang.value} className="flex items-center space-x-2 py-1">
                              <input
                                type="checkbox"
                                checked={(contact.languages || ['en']).includes(lang.value)}
                                onChange={(e) => {
                                  const currentLangs = contact.languages || ['en']
                                  const newLangs = e.target.checked
                                    ? [...currentLangs, lang.value]
                                    : currentLangs.filter((l) => l !== lang.value)
                                  handleContactChange(index, 'languages', newLangs)
                                }}
                              />
                              <span>{lang.label}</span>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addContact}>
                  + Add Contact
                </Button>
              </div>
            </>
          )}

          {/* Custom Fields Section */}
          <div className="space-y-2">
            <Label>Custom Fields</Label>
            {customFields.map((field, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  value={field.key}
                  onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                  placeholder="Field Key"
                  className="flex-1"
                />
                <Input
                  value={field.value}
                  onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                  placeholder="Field Value"
                  className="flex-1"
                />
                <Button
                  variant="destructive"
                  onClick={() => removeCustomField(index)}
                  disabled={customFields.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addCustomField}>
              Add Custom Field
            </Button>
          </div>
        </div>

        <Button onClick={generateSchema} className="w-full">
        <FileJson2 /> Generate Schema
        </Button>
      </div>

      {/* Right Side - Schema Output Panel */}
      <div className="md:col-span-4 p-6 bg-gray-100 space-y-4 overflow-y-auto">
        <div className="space-y-2">
          <Label>Generated JSON-LD</Label>
          {generatedSchema ? (
            <pre className="bg-white p-4 rounded-md overflow-auto">
              {generatedSchema}
            </pre>
          ) : (
            <p className="text-gray-500">No schema generated yet. Fill the form and click "Generate Schema".</p>
          )}
          <p className="text-sm text-gray-600 mb-5">
            Add this to your HTML: <br></br> <code>&lt;script type="application/ld+json"&gt;{generatedSchema}&lt;/script&gt;</code>
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCopy} disabled={!generatedSchema}>
            <Copy /> Copy
            </Button>
            <Button variant="destructive" onClick={resetForm}>
              <RefreshCcw /> Reset
            </Button>
          </div>
          {copyStatus && <p className="text-red-500 text-sm">{copyStatus}</p>}
        </div>
      </div>
    </div>
  )
}