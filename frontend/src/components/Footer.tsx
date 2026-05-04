import { Dog, Phone, Mail, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Marca */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-brand-500 text-white p-1.5 rounded-lg">
                <Dog size={18} />
              </div>
              <span className="font-bold text-lg text-slate-900">
                Ap<span className="text-brand-600">Vet</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Distribución de productos veterinarios con el trato personal que solo una empresa familiar puede ofrecer.
            </p>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Contacto</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-brand-500 shrink-0" />
                +34 641 58 00 81
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-brand-500 shrink-0" />
                informacion@apvet.es
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-brand-500 shrink-0 mt-0.5" />
                Calle Rubén Darío, 7, Local 6 · 18200 Maracena, Granada
              </li>
            </ul>
          </div>

          {/* Horario */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Horario</h3>
            <p className="text-sm text-slate-500">
              Lunes – Viernes<br />
              9:00 – 14:00 y 17:00 – 21:00
            </p>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} ApVet. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer