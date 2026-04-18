"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const whatsappNumber = "15551234567";
  const whatsappMessage = encodeURIComponent(
    "Hola, me gustaría obtener más información",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = encodeURIComponent(
      `Hola, mi nombre es ${formData.name}. ${formData.message}`,
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="pt-32 pb-20 px-4 bg-white min-h-screen">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
            Contáctanos
          </h1>
          <p className="text-xl text-gray-600">
            Estamos aquí para ayudarte a hacer crecer tu negocio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <Card className="border-2 border-brand/20 shadow-lg bg-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Envíanos un Mensaje
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Nombre Completo
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-2 border-gray-300 focus:border-brand"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Correo Electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-2 border-gray-300 focus:border-brand"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-gray-700 font-medium">
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="mt-2 border-gray-300 focus:border-brand"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-gray-700 font-medium">
                      Mensaje
                    </Label>
                    <Textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="mt-2 border-gray-300 focus:border-brand min-h-32"
                      placeholder="Cuéntanos sobre tu negocio y qué tipo de pallets te interesan..."
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-brand to-brand-dark hover:from-brand-dark hover:to-brand text-white"
                  >
                    <Send className="mr-2 w-5 h-5" />
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mr-4">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Respuesta Inmediata
                    </h3>
                    <p className="text-gray-600">Chatea con nosotros ahora</p>
                  </div>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 w-5 h-5" />
                    Abrir WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand/20 shadow-lg bg-white">
              <CardContent className="p-8 space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Información de Contacto
                </h3>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-dark rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Teléfono</h4>
                    <p className="text-gray-600">+506 7191 0009</p>
                    <p className="text-sm text-gray-500">Lunes a Viernes: 8:00 AM – 5:45 PM</p>
                    <p className="text-sm text-gray-500">Sábado: 8:00 AM – 12:00 MD</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-dark rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">info@liquidationwarehouse.com</p>
                    <p className="text-sm text-gray-500">Respuesta en 24 horas</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-dark rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Dirección</h4>
                    <p className="text-gray-600">San José Costa Rica</p>
                    <p className="text-gray-600">Los Angeles California</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand/20 shadow-lg bg-gradient-to-br from-brand/5 to-white">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Horario de Atención
                </h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium">Lunes - Viernes:</span>
                    <span>8:00 AM - 5:45 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sábado:</span>
                    <span>8:00 AM - 12:00 MD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Domingo:</span>
                    <span>Cerrado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
