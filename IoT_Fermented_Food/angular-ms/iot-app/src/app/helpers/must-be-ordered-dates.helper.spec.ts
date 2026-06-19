import { FormGroup, FormControl } from '@angular/forms';
import { MustBeOrderedDates } from './must-be-ordered-dates.helper';

describe('MustBeOrderedDates Helper', () => {

    it('should set error if init date is after end date', () => {
        const formGroup = new FormGroup({
            init: new FormControl(new Date('2023-01-02')),
            end: new FormControl(new Date('2023-01-01'))
        });

        const validator = MustBeOrderedDates('init', 'end');
        validator(formGroup);

        expect(formGroup.controls['init'].errors).toEqual({ mustMatch: true });
        expect(formGroup.controls['end'].errors).toEqual({ mustMatch: true });
    });

    it('should clear error if init date is before end date and end date is in past', () => {
        const now = Date.now();
        const formGroup = new FormGroup({
            init: new FormControl(new Date(now - 100000)),
            end: new FormControl(new Date(now - 50000))
        });

        const validator = MustBeOrderedDates('init', 'end');
        validator(formGroup);

        expect(formGroup.controls['init'].errors).toBeNull();
        expect(formGroup.controls['end'].errors).toBeNull();
    });

    it('should set error if end date is in the future', () => {
        const formGroup = new FormGroup({
            init: new FormControl(new Date()),
            end: new FormControl(new Date(Date.now() + 100000))
        });

        const validator = MustBeOrderedDates('init', 'end');
        validator(formGroup);

        expect(formGroup.controls['init'].errors).toEqual({ mustMatch: true });
        expect(formGroup.controls['end'].errors).toEqual({ mustMatch: true });
    });

    it('should ignore if there is another error on the end control', () => {
        const formGroup = new FormGroup({
            init: new FormControl(new Date('2023-01-02')),
            end: new FormControl(new Date('2023-01-01'))
        });

        // Set a different error
        formGroup.controls['end'].setErrors({ someError: true });

        const validator = MustBeOrderedDates('init', 'end');
        validator(formGroup);

        // mustMatch should not be set because there's already another error
        expect(formGroup.controls['end'].errors).toEqual({ someError: true });
    });
});
