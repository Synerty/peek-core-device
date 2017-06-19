from sqlalchemy import Column
from sqlalchemy import Integer, String
from vortex.Tuple import Tuple, addTupleType

from peek_core_device._private.PluginNames import deviceTuplePrefix
from peek_core_device._private.storage.DeclarativeBase import DeclarativeBase


@addTupleType
class StringIntTuple(Tuple, DeclarativeBase):
    __tupleType__ = deviceTuplePrefix + 'StringIntTuple'
    __tablename__ = 'StringIntTuple'

    id = Column(Integer, primary_key=True, autoincrement=True)
    string1 = Column(String(50))
    int1 = Column(Integer)