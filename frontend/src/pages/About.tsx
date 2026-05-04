import { MapPin, Phone, Mail, Clock, Heart } from 'lucide-react'

const About = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Hero */}
      <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 text-center">
        <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="text-brand-500" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Sobre nosotros</h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">
          Somos unos apasionados por la salud y el bienestar de los animales.
        </p>
      </div>

      {/* Nuestra Historia */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Nuestra historia: pasión por la salud animal desde el corazón de Granada
        </h2>
        <div className="prose prose-slate max-w-none space-y-4 text-slate-600 leading-relaxed">
          <p>
            En <strong className="text-slate-800">ApVet</strong>, no solo distribuimos productos veterinarios;
            cuidamos el motor que mantiene sanos a los animales de nuestra tierra. Somos una empresa
            familiar granadina con años de trayectoria, nacida del compromiso compartido por la excelencia
            y el respeto hacia el sector veterinario.
          </p>
          <p>
            Desde nuestros inicios, hemos tenido un objetivo claro: ser el aliado de confianza de clínicas
            y profesionales. Entendemos que detrás de cada pedido hay un paciente que necesita atención y
            un profesional que busca calidad. Por eso, combinamos la agilidad logística con ese trato
            personal que solo una familia puede ofrecer.
          </p>
        </div>
      </div>

      {/* Datos de contacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Contacto */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Contacto</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="bg-brand-50 p-2 rounded-lg shrink-0">
                <Phone className="text-brand-500" size={20} />
              </div>
              <div>
                <span className="block text-sm text-slate-500 font-medium">Teléfono</span>
                <span className="text-slate-800 font-medium">+34 641 58 00 81</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-brand-50 p-2 rounded-lg shrink-0">
                <Mail className="text-brand-500" size={20} />
              </div>
              <div>
                <span className="block text-sm text-slate-500 font-medium">Email</span>
                <span className="text-slate-800 font-medium">informacion@apvet.es</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-brand-50 p-2 rounded-lg shrink-0">
                <Clock className="text-brand-500" size={20} />
              </div>
              <div>
                <span className="block text-sm text-slate-500 font-medium">Horario de atención</span>
                <span className="text-slate-800">Lunes – Viernes: 9:00 – 14:00 y 17:00 – 21:00</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Dirección */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Dónde estamos</h2>
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-brand-50 p-2 rounded-lg shrink-0">
              <MapPin className="text-brand-500" size={20} />
            </div>
            <div>
              <span className="block text-sm text-slate-500 font-medium">Dirección</span>
              <span className="text-slate-800">Calle Rubén Darío, 7, Local 6</span>
              <span className="block text-slate-600">18200 Maracena, Granada, España</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default About