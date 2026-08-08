import { useTranslation } from 'react-i18next';

export function TranslationDebug() {
  const { t, i18n } = useTranslation();
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid red', 
      padding: '10px',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <div><strong>Debug Info:</strong></div>
      <div>Current Language: {i18n.language}</div>
      <div>Evidence Title: {t('evidenceUpload.title')}</div>
      <div>Choose Files: {t('evidenceUpload.chooseFiles')}</div>
      <div>Test Key Exists: {t('evidenceUpload.title') !== 'evidenceUpload.title' ? 'YES' : 'NO'}</div>
    </div>
  );
}
