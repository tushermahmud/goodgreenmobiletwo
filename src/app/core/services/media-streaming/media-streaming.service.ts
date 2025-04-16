import { Injectable } from '@angular/core';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { StreamingMedia, StreamingVideoOptions } from '@awesome-cordova-plugins/streaming-media/ngx';

@Injectable({
	providedIn: 'root'
})
export class MediaStreamingService {

	private streamingMediaOptions: StreamingVideoOptions = {
		successCallback: () => {
			console.log('Video played');
		},
		errorCallback: (e) => {
			console.log(JSON.stringify(e));
		},
		// orientation: 'landscape',
		shouldAutoClose: false,
		controls: true,
	};


	constructor(
		private photoViewer: PhotoViewer,
		private streamingMedia: StreamingMedia,
	) { }



	/**
	* This function plays media files (images or videos) using the appropriate plugin.
	* If the media file is an image, it uses the PhotoViewer plugin to display it.
	* If the media file is a video, it uses the StreamingMedia plugin to play it.
	*
	* @param mediaList An array of media objects to play
	* @param mediaIndex The index of the media object to play in the mediaList array
	* @throws An error if there is an issue playing the media file
	*/
	async playMedia(mediaList: any[], mediaIndex: number): Promise<void> {
		console.log('index', mediaIndex);
		try {
			const media = mediaList[mediaIndex];

			console.log('playing media:', JSON.stringify(media));

			if (media?.fileType === 'image') {
				this.photoViewer.show(media?.accessLink, '', {
					share: false,
					closeButton: true,
					copyToReference: false,
					headers: 'image/jpeg',
				});
			} else {
				this.streamingMedia.playVideo(
					media?.accessLink,
					this.streamingMediaOptions
				);
			}
		} catch (err) {
			console.log(`error playing media file;`, JSON.stringify(err));
			throw err;
		}
	}
}
