import { getSeoOverrides } from '../../src/utils/seoDictionary';

describe('seoDictionary', () => {
    it('returns null for unknown reference', () => {
        expect(getSeoOverrides('UNKNOWN', 'Negro')).toBeNull();
    });

    it('returns proper overrides for Q4A14 (Masculino)', () => {
        const result = getSeoOverrides('q4a14', 'Azul');
        expect(result?.audience).toBe('Masculino');
        expect(result?.title).toContain('Azul');
        expect(result?.title).toContain('Two Six');
    });

    it('returns proper overrides for Q4A11 (Unisex)', () => {
        const result = getSeoOverrides('q4a11', 'Verde');
        expect(result?.audience).toBe('Unisex');
        expect(result?.h1).toContain('Unisex');
    });

    it('returns proper overrides for Q4A12 (Femenino - Crop Top)', () => {
        const result = getSeoOverrides('q4a12', 'Crudo');
        expect(result?.audience).toBe('Femenino');
        expect(result?.alt).toContain('Crop Top color crudo');
    });

    it('returns proper overrides for Q4A13 (Femenino - Essentials)', () => {
        const result = getSeoOverrides('q4a13', 'Negro');
        expect(result?.audience).toBe('Femenino');
        expect(result?.title).toContain('Mujer Negra');
    });

    it('returns proper overrides for Q4A15 (Estampado Frente)', () => {
        const result = getSeoOverrides('q4a15', 'Rojo');
        expect(result?.title).toContain('Original');
        expect(result?.audience).toBe('Masculino');
    });

    it('handles empty or null parameters', () => {
        // @ts-ignore
        expect(getSeoOverrides(null, null)).toBeNull();
        expect(getSeoOverrides('', '')).toBeNull();
    });

    it('handles default cases for Q4A12 colors', () => {
        const result = getSeoOverrides('q4a12', 'Café');
        expect(result?.alt).toContain('estilo urbano');
    });

    it('handles grey for Q4A12', () => {
        const result = getSeoOverrides('q4a12', 'Gris');
        expect(result?.alt).toContain('marca Two Six');
    });

    it('handles default cases for Q4A13 colors', () => {
        const result = getSeoOverrides('q4a13', 'Azul');
        expect(result?.alt).toContain('marca Two Six');
        expect(result?.title).toContain('Azul');
    });

    it('handles black for Q4A12', () => {
        const result = getSeoOverrides('q4a12', 'Negro');
        expect(result?.alt).toContain('Crop Top negro');
    });

    it('handles white for Q4A16', () => {
        const result = getSeoOverrides('q4a16', 'Blanco');
        expect(result?.title).toContain('Camiseta Blanca');
    });

    it('handles white/crudo for Q4A13', () => {
        const result = getSeoOverrides('q4a13', 'Blanco');
        expect(result?.title).toContain('Mujer Cruda');
        expect(result?.alt).toContain('camiseta blanca/cruda');
    });

    it('handles non-white colors for Q4A16', () => {
        const result = getSeoOverrides('q4a16', 'Negro');
        expect(result?.title).toContain('Camiseta Negro');
    });
});
