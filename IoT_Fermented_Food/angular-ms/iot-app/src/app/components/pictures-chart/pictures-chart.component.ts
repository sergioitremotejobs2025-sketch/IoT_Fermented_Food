import { Component, signal } from '@angular/core'
import { Router } from '@angular/router'

import { ArduinoService } from '@services/arduino.service'
import { SocketService } from '@services/socket.service'
import { NotificationService } from '@services/notification.service'

import { Pictures } from '@models/pictures.model'
import { MeasureChart } from '@shared/measure-chart.class'
import { MatDialog } from '@angular/material/dialog'
import { LightboxComponent } from '@shared/lightbox/lightbox.component'
import { SliderComponent } from '@shared/slider/slider.component'

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-pictures-chart',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterModule,
        SliderComponent,
        LightboxComponent
    ],
    styleUrls: ['./pictures-chart.component.less'],
    templateUrl: './pictures-chart.component.html'
})
export class PicturesChartComponent extends MeasureChart {

    lastPicture = signal<Pictures | undefined>(undefined)
    selectedPicture = signal<Pictures | undefined>(undefined)
    history = signal<Pictures[]>([])

    constructor(
        private arduinoService: ArduinoService,
        private router: Router,
        private dialog: MatDialog,
        protected override socketService: SocketService,
        protected override notificationService: NotificationService
    ) {
        super('Imágenes', 'doughnut', socketService, notificationService)
    }

    async getCurrentMeasure(isFirstTime: boolean) {
        const picInfo = await this.arduinoService.getCurrentMeasure(this.micro.ip, 'pictures') as Pictures

        if (picInfo) {
            this.handleMeasure(picInfo, isFirstTime)
        } else if (!this.micro.isInactive) {
            this.setInactivity(true)
        }
    }

    drawData(picInfo: Pictures) {
        this.lastPicture.set(picInfo)
        if (!this.selectedPicture()) this.selectedPicture.set(picInfo)
        
        const currentHistory = this.history()
        if (currentHistory.length === 0 || currentHistory[0].timestamp !== picInfo.timestamp) {
            this.history.update(h => {
                const newHistory = [picInfo, ...h]
                if (newHistory.length > 20) newHistory.pop()
                return newHistory
            })
        }
        this.isChartReady = true
    }

    selectFromHistory(index: number) {
        const pic = this.history()[index]
        if (pic) {
            this.selectedPicture.set(pic);
        }
    }

    goToHistory() {
        this.router.navigate(['/dashboard/history-pictures', this.micro.ip])
    }

    openLightbox(picture: Pictures) {
        this.dialog.open(LightboxComponent, {
            data: {
                url: picture.image_url,
                title: `Captura: ${new Date(picture.timestamp).toLocaleString()}`
            },
            maxWidth: '95vw',
            maxHeight: '95vh',
            panelClass: 'glass-dialog'
        });
    }

}
