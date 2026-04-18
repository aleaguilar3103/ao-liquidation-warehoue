export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#0f1e30] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Lock Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">
          Sitio No Disponible
        </h1>

        {/* Message */}
        <p className="text-white/70 text-lg leading-relaxed mb-8">
          Esta página no está disponible en este momento. Estamos trabajando
          para volver pronto.
        </p>

        {/* Divider */}
        <div className="w-16 h-0.5 bg-white/30 mx-auto mb-8" />

        {/* Contact */}
        <p className="text-white/50 text-sm">
          ¿Tienes alguna pregunta? Contáctanos directamente.
        </p>
      </div>
    </div>
  );
}
