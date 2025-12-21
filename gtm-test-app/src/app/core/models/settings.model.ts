export interface Setting {
  id: string;
  gtm_container_id: string;
  ga_measurement_id: string;
  updated_at: string;
}

export interface CreateSettingRequest {
  gtm_container_id: string;
  ga_measurement_id: string;
}

export interface UpdateSettingRequest {
  gtm_container_id: string;
  ga_measurement_id: string;
}
