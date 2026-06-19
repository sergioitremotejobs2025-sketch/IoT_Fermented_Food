import { FormGroup, FormControl } from '@angular/forms';
import { MustMatch } from './must-match.helper';

describe('MustMatch Helper', () => {
    it('should return nothing if controls do not exist', () => {
        const formGroup = new FormGroup({});
        const validator = MustMatch('password', 'confirmPassword');
        expect(() => validator(formGroup)).not.toThrow();
    });

    it('should set error if values do not match', () => {
        const formGroup = new FormGroup({
            password: new FormControl('pass1'),
            confirmPassword: new FormControl('pass2')
        });

        const validator = MustMatch('password', 'confirmPassword');
        validator(formGroup);

        expect(formGroup.controls['password'].errors).toEqual({ mustMatch: true });
        expect(formGroup.controls['confirmPassword'].errors).toEqual({ mustMatch: true });
    });

    it('should clear error if values match', () => {
        const formGroup = new FormGroup({
            password: new FormControl('pass1'),
            confirmPassword: new FormControl('pass1')
        });

        const validator = MustMatch('password', 'confirmPassword');
        validator(formGroup);

        expect(formGroup.controls['password'].errors).toBeNull();
        expect(formGroup.controls['confirmPassword'].errors).toBeNull();
    });

    it('should ignore if there is another error on the matching control', () => {
        const formGroup = new FormGroup({
            password: new FormControl('pass1'),
            confirmPassword: new FormControl('pass2')
        });

        // Set a different error
        formGroup.controls['confirmPassword'].setErrors({ someError: true });

        const validator = MustMatch('password', 'confirmPassword');
        validator(formGroup);

        // mustMatch should not be set because there's already another error
        expect(formGroup.controls['confirmPassword'].errors).toEqual({ someError: true });
    });
});
