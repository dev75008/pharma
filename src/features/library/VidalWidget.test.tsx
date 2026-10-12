import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';
import { VidalWidget } from './VidalWidget';

it('charge uniquement sur demande et conserve un accès direct en cas d’erreur', async () => {
 const selector = 'script[src="https://www.vidal.fr/includes/javascript/vidal/widget/WidgetVidal.js"]';
 const { unmount } = render(<VidalWidget/>);
 expect(document.querySelector(selector)).toBeNull();
 fireEvent.click(screen.getByRole('button', { name: 'Charger le module VIDAL' }));
 const script = document.querySelector(selector)!;
 expect(script).not.toBeNull();
 fireEvent.error(script);
 await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Le module VIDAL ne répond pas'));
 expect(screen.getByRole('link', { name: 'Consulter VIDAL (nouvel onglet)' })).toHaveAttribute('href', 'https://www.vidal.fr/');
 unmount();
 expect(document.querySelector(selector)).toBeNull();
});
