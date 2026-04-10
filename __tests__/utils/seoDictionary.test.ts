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

    it('returns proper overrides for Q4A16 (Gorila Espalda)', () => {
        const result = getSeoOverrides('q4a16', 'Blanco', 'Masculino');
        expect(result?.title).toContain('Camiseta Blanca');
        expect(result?.audience).toBe('Masculino');
    });
});
