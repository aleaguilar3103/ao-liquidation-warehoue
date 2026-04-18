import { Target, Truck } from "lucide-react";

export default function TrustSection() {
  const features = [
    {
      icon: Target,
      title: "Compromiso a Largo Plazo",
      description: "Nos enfocamos en ser su proveedor constante y confiable. Establecemos flujos de inventario que crecen con su negocio.",
    },
    {
      icon: Truck,
      title: "Coordinamos tu envío a todo Costa Rica",
      description: "Gestionamos la logística completa desde nuestro almacén hasta su ubicación en cualquier punto de Costa Rica, asegurando entregas puntuales y seguras.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow border-2 border-gray-100 hover:border-brand/20"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-brand to-brand-dark rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}