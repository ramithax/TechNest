from typing import Optional
from pydantic import BaseModel, ConfigDict


Number = float | int | str


class ProductSpecifications(BaseModel):

    model_config = ConfigDict(
        extra="ignore"
    )

    component_type: Optional[str] = None

    # Processor / Motherboard
    socket: Optional[str] = None

    # Processor
    cores: Optional[Number] = None
    threads: Optional[Number] = None
    tdp_w: Optional[Number] = None

    # Memory
    memory_type: Optional[str] = None
    capacity_gb: Optional[Number] = None
    speed_mhz: Optional[Number] = None
    modules: Optional[Number] = None

    # Motherboard
    form_factor: Optional[str] = None
    ram_slots: Optional[Number] = None
    max_ram_gb: Optional[Number] = None
    m2_slots: Optional[Number] = None

    # GPU
    gpu_length_mm: Optional[Number] = None
    power_consumption_w: Optional[Number] = None
    power_connectors: Optional[list[str] | str] = None

    # Storage
    storage_type: Optional[str] = None
    interface: Optional[str] = None

    # PSU
    psu_wattage: Optional[Number] = None
    efficiency_rating: Optional[str] = None
    modular: Optional[bool | str] = None
    pcie_connectors: Optional[list[str] | str] = None

    # Case
    case_form_factor: Optional[str] = None
    max_gpu_length_mm: Optional[Number] = None
    max_cpu_cooler_height_mm: Optional[Number] = None

    # CPU Cooler
    supported_sockets: Optional[list[str] | str] = None
    cooler_height_mm: Optional[Number] = None
    tdp_rating_w: Optional[Number] = None