import { Component, OnInit, signal, computed } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'

import { ArduinoService } from '@services/arduino.service'
import { Microcontroller } from '@models/microcontroller.model'
import { Pictures } from '@models/pictures.model'
import { MustBeOrderedDates } from '@helpers/must-be-ordered-dates.helper'

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardMicrocontrollerComponent } from '@components/dashboard-microcontroller/dashboard-microcontroller.component';

@Component({
    selector: 'app-pictures-history',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule,
        DashboardMicrocontrollerComponent
    ],
    styleUrls: ['./pictures-history.component.less'],
    templateUrl: './pictures-history.component.html'
})
export class PicturesHistoryComponent implements OnInit {

    micro = signal<Microcontroller | undefined>(undefined);
    pictures = signal<Pictures[]>([]);
    isLoading = signal(false);
    noResults = signal(false);

    // Timelapse state
    isTimelapsePlaying = signal(false);
    timelapseIndex = signal(0);
    timelapseTimer: any;
    timelapseSpeed = 500;

    historyForm: FormGroup;
    currentStageFilter = signal('all');

    filteredPictures = computed(() => {
        const q = this.currentStageFilter();
        const all = this.pictures();
        if (q === 'all') return all;
        return all.filter(p => p.stage === q);
    });

    stages = [
        { value: 'all', label: 'Todos los estados' },
        { value: 'seedling', label: '🌱 Brote' },
        { value: 'young_plant', label: '🌿 Planta joven' },
        { value: 'flowering', label: '🌸 Floración' },
        { value: 'green_fruit', label: '🍅 Fruto verde' },
        { value: 'ripe_fruit', label: '🍅 Fruto maduro' }
    ];

    constructor(
        private route: ActivatedRoute,
        private arduinoService: ArduinoService,
        private formBuilder: FormBuilder
    ) {
        this.historyForm = this.formBuilder.group(
            {
                init_date: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), Validators.required],
                end_date: [new Date(), Validators.required]
            },
            { validator: MustBeOrderedDates('init_date', 'end_date') }
        )
    }

    async ngOnInit() {
        const ip = this.route.snapshot.paramMap.get('ip')
        const measure = 'pictures'
        try {
            const data = await this.arduinoService.getMicrocontroller(ip, measure)
            this.micro.set(data);
        } catch (error) { }
    }

    loadHistory({ init_date, end_date }: { init_date: Date, end_date: Date }) {
        this.isLoading.set(true);
        this.noResults.set(false);
        this.pictures.set([]);
        this.stopTimelapse()

        const ip = this.micro()?.ip;
        if (!ip) return;

        this.arduinoService.getPicturesHistory(
            ip,
            init_date.toJSON(),
            end_date.toJSON()
        ).subscribe(
            (data: Pictures[]) => {
                this.pictures.set(data);
                this.noResults.set(data.length === 0);
                this.isLoading.set(false);
            },
            () => {
                this.noResults.set(true);
                this.isLoading.set(false);
            }
        )
    }

    toggleTimelapse() {
        if (this.isTimelapsePlaying()) {
            this.stopTimelapse()
        } else if (this.filteredPictures().length > 0) {
            this.isTimelapsePlaying.set(true);
            this.timelapseIndex.set(0);
            this.playNextFrame()
        }
    }

    playNextFrame() {
        this.timelapseTimer = setTimeout(() => {
            if (!this.isTimelapsePlaying()) return;
            this.timelapseIndex.update(i => (i + 1) % this.filteredPictures().length);
            this.playNextFrame();
        }, this.timelapseSpeed)
    }

    stopTimelapse() {
        this.isTimelapsePlaying.set(false);
        if (this.timelapseTimer) {
            clearTimeout(this.timelapseTimer)
        }
    }

    stageLabel(stage: string): string {
        const labels: { [key: string]: string } = {
            seedling: '🌱 Brote',
            young_plant: '🌿 Planta joven',
            flowering: '🌸 Floración',
            green_fruit: '🍅 Fruto verde',
            ripe_fruit: '🍅 Fruto maduro'
        }
        return labels[stage] || stage
    }

}
