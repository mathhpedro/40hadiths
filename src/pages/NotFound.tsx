import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { Glass } from '../components/glass/Glass'

export function NotFound() {
  const { t } = useLang()
  return (
    <Glass className="mt-8 px-6 py-16 text-center">
      <p className="hadith-numeral" style={{ fontSize: '3rem' }}>
        ۞
      </p>
      <p className="mt-4 font-semibold">{t('notFound')}</p>
      <Link to="/" className="btn btn--primary mt-6">
        {t('backHome')}
      </Link>
    </Glass>
  )
}
