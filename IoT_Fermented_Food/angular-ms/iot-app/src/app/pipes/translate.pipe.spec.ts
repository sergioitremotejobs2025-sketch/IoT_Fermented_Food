import { TranslatePipe } from './translate.pipe';
import { LanguageService } from '../services/language.service';
import { of } from 'rxjs';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let languageServiceSpy: jasmine.SpyObj<LanguageService>;

  beforeEach(() => {
    languageServiceSpy = jasmine.createSpyObj('LanguageService', ['translate']);
    pipe = new TranslatePipe(languageServiceSpy);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should call service.translate with the key', () => {
    languageServiceSpy.translate.and.returnValue('Translated Value');
    const result = pipe.transform('TEST.KEY');
    expect(languageServiceSpy.translate).toHaveBeenCalledWith('TEST.KEY');
    expect(result).toBe('Translated Value');
  });
});
